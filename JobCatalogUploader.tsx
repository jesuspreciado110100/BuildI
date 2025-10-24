import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { JobCatalogParser, ParsedJobCatalog } from '../services/JobCatalogParser';
import { JobSupabaseService } from '../services/JobSupabaseService';

interface JobCatalogUploaderProps {
  siteId: string;
  onJobsUploaded: (jobs: ParsedJobCatalog) => void;
}

export const JobCatalogUploader: React.FC<JobCatalogUploaderProps> = ({
  siteId,
  onJobsUploaded
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedData, setUploadedData] = useState<ParsedJobCatalog | null>(null);
  const [showValidationDetails, setShowValidationDetails] = useState(false);

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.txt,.xlsx';
    
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      setIsProcessing(true);
      
      try {
        const text = await file.text();
        let parsedData: ParsedJobCatalog;
        
        if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
          parsedData = await JobCatalogParser.parseAndValidateCSV(text, siteId);
        } else {
          parsedData = await JobCatalogParser.parseAndValidateExcel(text, siteId);
        }
        
        setUploadedData(parsedData);
        
        // Show validation summary
        const validCount = parsedData.validJobs.length;
        const invalidCount = parsedData.invalidJobs.length;
        const duplicateCount = parsedData.duplicates.length;
        
        Alert.alert(
          'Procesamiento Completo',
          `Válidos: ${validCount}\nInválidos: ${invalidCount}\nDuplicados: ${duplicateCount}`,
          [
            { text: 'Ver Detalles', onPress: () => setShowValidationDetails(true) },
            { text: 'Continuar', onPress: () => handleSaveJobs(parsedData) }
          ]
        );
        
      } catch (error) {
        Alert.alert('Error', 'No se pudo procesar el archivo');
      } finally {
        setIsProcessing(false);
      }
    };
    
    input.click();
  };

  const handleSaveJobs = async (data: ParsedJobCatalog) => {
    if (data.validJobs.length === 0) {
      Alert.alert('Sin trabajos válidos', 'No hay trabajos válidos para guardar');
      return;
    }

    setIsProcessing(true);
    
    try {
      const jobsToSave = data.validJobs.map(job => ({
        site_id: siteId,
        concept_id: job.concept_id,
        job_id: job.job_id,
        description: job.description,
        unit: job.unit,
        quantity: job.quantity,
        unit_price: job.unit_price
      }));

      const result = await JobSupabaseService.insertJobsBatch(jobsToSave);
      
      if (result.success) {
        Alert.alert(
          'Éxito',
          `Se guardaron ${result.insertedCount} trabajos correctamente`
        );
        onJobsUploaded(data);
      } else {
        Alert.alert('Error', result.error || 'Error al guardar trabajos');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al guardar en la base de datos');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSample = () => {
    const sample = JobCatalogParser.generateSampleCSV();
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_jobs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Catálogo de Trabajos
      </Text>
      
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <TouchableOpacity
          onPress={handleFileUpload}
          disabled={isProcessing}
          style={{
            flex: 1,
            backgroundColor: isProcessing ? '#ccc' : '#007AFF',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center'
          }}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              Subir Catálogo
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={downloadSample}
          style={{
            backgroundColor: '#28a745',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Descargar Ejemplo
          </Text>
        </TouchableOpacity>
      </View>

      {uploadedData && (
        <View style={{ backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Resumen de Procesamiento:
          </Text>
          <Text>• Total procesados: {uploadedData.totalJobs}</Text>
          <Text style={{ color: '#28a745' }}>• Válidos: {uploadedData.validJobs.length}</Text>
          <Text style={{ color: '#dc3545' }}>• Inválidos: {uploadedData.invalidJobs.length}</Text>
          <Text style={{ color: '#ffc107' }}>• Duplicados: {uploadedData.duplicates.length}</Text>
          <Text>• Valor total válido: ${uploadedData.validJobs.reduce((sum, job) => sum + job.total_price, 0).toLocaleString()}</Text>
        </View>
      )}

      {showValidationDetails && uploadedData && (
        <View style={{ backgroundColor: '#fff3cd', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Detalles de Validación:
          </Text>
          
          {uploadedData.invalidJobs.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontWeight: 'bold', color: '#dc3545' }}>
                Trabajos Inválidos:
              </Text>
              {uploadedData.invalidJobs.slice(0, 3).map((job, index) => (
                <Text key={index} style={{ fontSize: 12, marginLeft: 8 }}>
                  • {job.job_id}: {job.errors?.[0]}
                </Text>
              ))}
              {uploadedData.invalidJobs.length > 3 && (
                <Text style={{ fontSize: 12, marginLeft: 8, fontStyle: 'italic' }}>
                  ... y {uploadedData.invalidJobs.length - 3} más
                </Text>
              )}
            </View>
          )}

          {uploadedData.duplicates.length > 0 && (
            <View>
              <Text style={{ fontWeight: 'bold', color: '#ffc107' }}>
                Trabajos Duplicados:
              </Text>
              {uploadedData.duplicates.slice(0, 3).map((job, index) => (
                <Text key={index} style={{ fontSize: 12, marginLeft: 8 }}>
                  • {job.job_id}: Ya existe en el sitio
                </Text>
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={() => setShowValidationDetails(false)}
            style={{
              marginTop: 12,
              padding: 8,
              backgroundColor: '#6c757d',
              borderRadius: 4,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white' }}>Cerrar Detalles</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};