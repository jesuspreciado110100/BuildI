import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, SafeAreaView, ImageBackground, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { MachinerySupabaseService } from '../services/MachinerySupabaseService';
import { MachineryResultCard } from './MachineryResultCard';
import { SortFilterBar } from './SortFilterBar';
import { PriceRangeSelector } from './PriceRangeSelector';

// Machinery Type ID mappings (supports both singular and plural forms)
const MACHINERY_TYPE_IDS: { [key: string]: string } = {
  'articulated truck': '251a861d-8f49-4ffb-a371-d65f584891a6',
  'articulated trucks': '251a861d-8f49-4ffb-a371-d65f584891a6',
  'asphalt paver': 'fcd250f0-51e2-4530-aa2b-47016261f4dc',
  'asphalt pavers': 'fcd250f0-51e2-4530-aa2b-47016261f4dc',
  'backhoe': '886b4c89-2aa9-4bb4-a604-21b27b17d7eb',
  'backhoes': '886b4c89-2aa9-4bb4-a604-21b27b17d7eb',
  'backhoe loader': 'f5c6dbba-3320-4796-b438-f6d79753261d',
  'backhoe loaders': 'f5c6dbba-3320-4796-b438-f6d79753261d',
  'cold planer': 'e36f5c0d-b3dd-4dfe-bf52-8e5d59b132c1',
  'cold planers': 'e36f5c0d-b3dd-4dfe-bf52-8e5d59b132c1',
  'compactor': '820c1dbf-4f9d-498e-a690-64ff31f2d945',
  'compactors': '820c1dbf-4f9d-498e-a690-64ff31f2d945',
  'dozer': '30551590-c6a8-4de7-97d1-c7a3b7d3ba66',
  'dozers': '30551590-c6a8-4de7-97d1-c7a3b7d3ba66',
  'dragline': '6af16479-411f-4d5f-9c3a-e470becd9557',
  'draglines': '6af16479-411f-4d5f-9c3a-e470becd9557',
  'drill': 'd3493c35-71af-4c37-b006-1764215434ab',
  'drills': 'd3493c35-71af-4c37-b006-1764215434ab',
  'excavator': '8db90ead-4a4f-491d-996f-abff7a912948',
  'excavators': '8db90ead-4a4f-491d-996f-abff7a912948',
  'forest machine': '91eb1af8-1ef3-491b-bcd1-07dc4329fd01',
  'forest machines': '91eb1af8-1ef3-491b-bcd1-07dc4329fd01',
  'hydraulic mining shovel': 'c0f63e45-230b-4c99-9d38-731387028906',
  'hydraulic mining shovels': 'c0f63e45-230b-4c99-9d38-731387028906',
  'electric rope shovel': '5fb7d76b-6852-47ea-84ee-d3ea549b369e',
  'electric rope shovels': '5fb7d76b-6852-47ea-84ee-d3ea549b369e',
};



interface MachineryTypeAccessoryScreenProps {
  visible: boolean;
  onClose: () => void;
  machineryType: string;
}

export const MachineryTypeAccessoryScreen: React.FC<MachineryTypeAccessoryScreenProps> = ({
  visible,
  onClose,
  machineryType
}) => {
  const [selectedAttachment, setSelectedAttachment] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [screedWidth, setScreedWidth] = useState<number>(3);
  const [millingWidth, setMillingWidth] = useState<number>(1);
  const [bucketCapacity, setBucketCapacity] = useState<number>(24);
  const [boomLength, setBoomLength] = useState<number>(75);
  const [workingWeight, setWorkingWeight] = useState<number>(1.7);
  const [pullDownCapacity, setPullDownCapacity] = useState<number>(15000);
  const [holeDiameter, setHoleDiameter] = useState<number>(140);
  const [priceRange, setPriceRange] = useState<number>(100);
  const [unitRate, setUnitRate] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily');
  const [defaultRate, setDefaultRate] = useState<number>(100);
  const [machineryResults, setMachineryResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'price' | 'distance' | 'newest'>('price');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const sizes = ['Pequeño (15-25 ton)', 'Mediano (25-35 ton)', 'Grande (35-45 ton)', 'Extra Grande (45+ ton)'];
  
  const backhoeRearBuckets = ['Coral Buckets', 'Cribbing Buckets', 'Ditch Cleaning Buckets', 'Grading Buckets', 'Heavy Duty Buckets', 'Heavy Duty Rock Buckets', 'High Capacity Buckets', 'Soil Excavation Buckets', 'Standard Duty Buckets', 'Tilting Ditch Cleaning Buckets'];
  const backhoeFrontBuckets = ['Teeth', 'Cutting Edge', 'Base Edge w Forks'];
  const coldPlanerAttachments = ['Cutting Drum', 'Side Plates', 'Conveyor Belt', 'Water Spray System'];
  const compactorAttachments = ['Vibration System', 'Water Tank', 'Padfoot Shell', 'Smooth Drum', 'Tire Pressure System'];
  const dozerAttachments = ['Straight Blade', 'Universal Blade', 'Angle Blade', 'Cushion Blade', 'Semi-Universal Blade', 'Power-Angle-Tilt Blade', 'Ripper', 'Winch'];
  const draglineAttachments = ['Drag Bucket', 'Clamshell Bucket', 'Magnet', 'Grapple', 'Pile Driver'];
  const drillAttachments = ['Rotary Drill Bit', 'Auger', 'Kelly Bar', 'Casing', 'Drill Stem', 'Mud Pump'];
  const excavatorBuckets = ['Clean-up', 'Digging Buckets - Mini Excavator', 'Ditch Cleaning', 'Ditch Cleaning Buckets - Mini Excavator', 'Ditch Cleaning Tilt', 'Extreme Duty', 'General Duty', 'Grading Buckets - Mini Excavator', 'Heavy Duty', 'Heavy Duty Buckets - Mini Excavator', 'Heavy Duty Capacity Buckets - Mini Excavator', 'Heavy Duty Rock Buckets - Mini Excavator', 'Nordic Digging Buckets', 'Nordic Grading Buckets', 'Nordic Trenching Buckets', 'Severe Duty', 'Tilting Ditch Cleaning Buckets - Mini Excavator', 'Variable Tooth Spacing'];
  const standardAttachments = ['Cuchara estándar', 'Cuchara de roca', 'Martillo hidráulico', 'Pulgar hidráulico'];

  
  const periods = ['Por día', 'Por semana', 'Por mes', 'Por proyecto'];
  
  const articulatedTruckModels = [
    { name: 'Bare Chassis', image: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1753819742612_c308714f.webp' },
    { name: 'Three Axle', image: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1753819743497_6bc423f6.webp' }
  ];

  const asphaltPaverModels = [
    { name: 'Track', image: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1753819742612_c308714f.webp' },
    { name: 'Wheel', image: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1753819743497_6bc423f6.webp' }
  ];

  const backhoeLoaderModels = [
    { name: 'Center-pivot', image: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1753903080524_5e6e55bb.webp' },
    { name: 'Side shift', image: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1753903081854_2ff12425.webp' }
  ];

  const coldPlanerModels = [
    { name: 'Track Type', image: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1753904242123_d6e8a7f1.webp' },
    { name: 'Wheel Type', image: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1753904242845_a3c2b8e4.webp' }
  ];

  const compactorModels = [
    { name: 'Landfill', image: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1753906242259_d1eca852.jpeg' },
    { name: 'Pneumatic Roller', image: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1753906242259_d1eca852.jpeg' },
    { name: 'Soil', image: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1753906242259_d1eca852.jpeg' },
    { name: 'Tandem Vibratory Roller', image: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1753906242259_d1eca852.jpeg' },
    { name: 'Vibratory Soil', image: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1753906242259_d1eca852.jpeg' }
  ];

  const dozerModels = [
    { name: 'Small (D1-D3)', image: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1753908488067_4016f34d.jpeg' },
    { name: 'Medium (D4-D6)', image: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1753908488067_4016f34d.jpeg' },
    { name: 'Large (D7-D9)', image: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1753908488067_4016f34d.jpeg' },
    { name: 'Wheel Dozers', image: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1753908488067_4016f34d.jpeg' }
  ];

  const forestMachineModels = [
    { name: 'Harvester', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400' },
    { name: 'Forwarder', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400' },
    { name: 'Feller Buncher', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400' },
    { name: 'Delimber', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400' }
  ];

  const forestMachineAttachments = ['Harvesting Head', 'Delimbing Knives', 'Measuring System', 'Crane', 'Grapple', 'Saw Unit', 'Feed Rollers', 'Cutting Blade'];
  
  const hydraulicMiningShovelModels = [
    { name: 'PC8000-6', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400' },
    { name: 'EX8000-6', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400' },
    { name: '6060FS', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400' },
    { name: '6020B', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400' }
  ];

  const hydraulicMiningShovelAttachments = ['Mining Bucket', 'Rock Bucket', 'Loading Shovel', 'Dipper', 'Boom Extension'];
  
  const [bucketPayload, setBucketPayload] = useState<number>(15);

  // Load default rate when modal opens
  useEffect(() => {
    if (visible) {
      const machineryTypeKey = machineryType.toLowerCase();
      const machineryTypeId = MACHINERY_TYPE_IDS[machineryTypeKey];
      
      if (machineryTypeId) {
        MachinerySupabaseService.getDefaultRate(machineryTypeId).then(rate => {
          setDefaultRate(rate);
          setPriceRange(rate);
        });
      }
    }
  }, [visible, machineryType]);

  // Filter and sort machinery results
  const filteredAndSortedResults = useMemo(() => {
    let filtered = machineryResults.filter(item => {
      // Filter by price range based on unit rate
      const itemRate = unitRate === 'hourly' ? item.hourly_rate : 
                       unitRate === 'daily' ? item.daily_rate : 
                       unitRate === 'weekly' ? item.weekly_rate : 
                       unitRate === 'monthly' ? item.monthly_rate : 
                       item.rate;
      
      if (itemRate && itemRate > priceRange) return false;
      
      // Filter by selected attachment if any
      if (selectedAttachment && item.attachments && !item.attachments.includes(selectedAttachment)) return false;
      
      return true;
    });

    // Sort results
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          const aRate = unitRate === 'hourly' ? a.hourly_rate : unitRate === 'daily' ? a.daily_rate : a.rate;
          const bRate = unitRate === 'hourly' ? b.hourly_rate : unitRate === 'daily' ? b.daily_rate : b.rate;
          return (aRate || 0) - (bRate || 0);
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        default:
          return 0;
      }
    });
  }, [machineryResults, priceRange, selectedAttachment, sortBy, unitRate]);

  const handleRequestQuote = async () => {
    setIsLoading(true);
    setCurrentPage(0);
    try {
      // Get machinery type ID from mapping
      const machineryTypeKey = machineryType.toLowerCase();
      const machineryTypeId = MACHINERY_TYPE_IDS[machineryTypeKey];
      
      console.log('Searching for machinery:', { 
        machineryType, 
        machineryTypeKey, 
        machineryTypeId,
        priceRange,
        unitRate 
      });
      
      if (!machineryTypeId) {
        console.error('No machinery type ID found for:', machineryType);
        setMachineryResults([]);
        setShowResults(true);
        setIsLoading(false);
        return;
      }

      const { data, count } = await MachinerySupabaseService.getMachineryByTypeId(
        machineryTypeId,
        0,
        10,
        {
          model: selectedModel,
          attachment: selectedAttachment,
          maxPrice: priceRange,
          unitRate: unitRate
        }
      );
      
      console.log('Machinery search results:', { count, dataLength: data.length });
      
      setMachineryResults(data);
      setTotalCount(count);
      setHasMore(data.length === 10);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching machinery:', error);
      setMachineryResults([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };


  const loadMoreMachinery = async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const machineryTypeKey = machineryType.toLowerCase();
      const machineryTypeId = MACHINERY_TYPE_IDS[machineryTypeKey];
      
      if (!machineryTypeId) return;

      const nextPage = currentPage + 1;
      const { data, count } = await MachinerySupabaseService.getMachineryByTypeId(
        machineryTypeId,
        nextPage,
        10,
        {
          model: selectedModel,
          attachment: selectedAttachment,
          maxPrice: priceRange,
          unitRate: unitRate
        }
      );
      
      setMachineryResults([...machineryResults, ...data]);
      setCurrentPage(nextPage);
      setHasMore(data.length === 10);
    } catch (error) {
      console.error('Error loading more machinery:', error);
    } finally {
      setIsLoading(false);
    }
  };





  const renderModelSelector = () => {
    const isArticulatedTruck = machineryType.toLowerCase().includes('articulated');
    const isAsphaltPaver = machineryType.toLowerCase().includes('asphalt') || machineryType.toLowerCase().includes('paver');
    const isBackhoeLoader = machineryType.toLowerCase().includes('backhoe') || machineryType.toLowerCase().includes('loader');
    const isColdPlaner = machineryType.toLowerCase().includes('cold') || machineryType.toLowerCase().includes('planer');
    const isDozer = machineryType.toLowerCase().includes('dozer');
    const isCompactor = machineryType.toLowerCase().includes('compactor');
    const isDragline = machineryType.toLowerCase().includes('dragline');
    const isForestMachine = machineryType.toLowerCase().includes('forest');
    const isHydraulicMiningShovel = machineryType.toLowerCase().includes('hydraulic') && machineryType.toLowerCase().includes('mining') && machineryType.toLowerCase().includes('shovel');
    
    if (!isArticulatedTruck && !isAsphaltPaver && !isBackhoeLoader && !isColdPlaner && !isCompactor && !isDozer && !isDragline && !isForestMachine && !isHydraulicMiningShovel) return null;

    const models = isArticulatedTruck ? articulatedTruckModels : 
                   isAsphaltPaver ? asphaltPaverModels : 
                   isBackhoeLoader ? backhoeLoaderModels :
                   isColdPlaner ? coldPlanerModels :
                   isCompactor ? compactorModels :
                   isDozer ? dozerModels :
                   isForestMachine ? forestMachineModels :
                   isHydraulicMiningShovel ? hydraulicMiningShovelModels :
                   [];

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Modelo</Text>
        <View style={styles.modelGrid}>
          {models.map((model) => (
            <TouchableOpacity
              key={model.name}
              style={[styles.modelCard, selectedModel === model.name && styles.selectedModelCard]}
              onPress={() => setSelectedModel(model.name)}
            >
              <ImageBackground
                source={{ uri: model.image }}
                style={styles.modelImageBackground}
                imageStyle={styles.modelImage}
              >
                <View style={styles.modelOverlay}>
                  <Text style={[styles.modelText, selectedModel === model.name && styles.selectedModelText]}>
                    {model.name}
                  </Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderHydraulicMiningShovelSpecSelectors = () => {
    const isHydraulicMiningShovel = machineryType.toLowerCase().includes('hydraulic') && machineryType.toLowerCase().includes('mining') && machineryType.toLowerCase().includes('shovel');
    
    if (!isHydraulicMiningShovel) return null;

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Bucket Payload</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>15t</Text>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={15}
              maximumValue={60}
              value={bucketPayload}
              onValueChange={setBucketPayload}
              minimumTrackTintColor="#0EA5E9"
              maximumTrackTintColor="#E2E8F0"
              thumbStyle={styles.sliderThumb}
            />
          </View>
          <Text style={styles.priceLabel}>60t</Text>
        </View>
        <Text style={styles.currentPrice}>{Math.round(bucketPayload)}t</Text>
      </View>
    );
  };

  const renderScreedWidthSelector = () => {
    const isAsphaltPaver = machineryType.toLowerCase().includes('asphalt') || machineryType.toLowerCase().includes('paver');
    
    if (!isAsphaltPaver) return null;

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Ancho del Screed</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>2m</Text>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={2}
              maximumValue={8}
              value={screedWidth}
              onValueChange={setScreedWidth}
              minimumTrackTintColor="#0EA5E9"
              maximumTrackTintColor="#E2E8F0"
              thumbStyle={styles.sliderThumb}
            />
          </View>
          <Text style={styles.priceLabel}>8m</Text>
        </View>
        <Text style={styles.currentPrice}>{screedWidth.toFixed(1)}m</Text>
      </View>
    );
  };

  const renderMillingWidthSelector = () => {
    const isColdPlaner = machineryType.toLowerCase().includes('cold') || machineryType.toLowerCase().includes('planer');
    
    if (!isColdPlaner) return null;

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Ancho de Fresado</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>0.5m</Text>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={4}
              value={millingWidth}
              onValueChange={setMillingWidth}
              minimumTrackTintColor="#0EA5E9"
              maximumTrackTintColor="#E2E8F0"
              thumbStyle={styles.sliderThumb}
            />
          </View>
          <Text style={styles.priceLabel}>4m</Text>
        </View>
        <Text style={styles.currentPrice}>{millingWidth.toFixed(1)}m</Text>
      </View>
    );
  };

  const renderDrillSpecSelectors = () => {
    const isDrill = machineryType.toLowerCase().includes('drill');
    
    if (!isDrill) return null;

    return (
      <>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Capacidad de Tracción</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>15,000kg</Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={15000}
                maximumValue={64000}
                value={pullDownCapacity}
                onValueChange={setPullDownCapacity}
                minimumTrackTintColor="#0EA5E9"
                maximumTrackTintColor="#E2E8F0"
                thumbStyle={styles.sliderThumb}
              />
            </View>
            <Text style={styles.priceLabel}>64,000kg</Text>
          </View>
          <Text style={styles.currentPrice}>{Math.round(pullDownCapacity).toLocaleString()}kg</Text>
        </View>
      </>
    );
  };

  const renderDraglineSpecSelectors = () => {
    const isDragline = machineryType.toLowerCase().includes('dragline');
    
    if (!isDragline) return null;

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Capacidad del Balde</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>24m³</Text>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={24}
              maximumValue={116}
              value={bucketCapacity}
              onValueChange={setBucketCapacity}
              minimumTrackTintColor="#0EA5E9"
              maximumTrackTintColor="#E2E8F0"
              thumbStyle={styles.sliderThumb}
            />
          </View>
          <Text style={styles.priceLabel}>116m³</Text>
        </View>
        <Text style={styles.currentPrice}>{Math.round(bucketCapacity)}m³</Text>
      </View>
    );
  };

  const renderElectricRopeShovelSpecSelectors = () => {
    const isElectricRopeShovel = machineryType.toLowerCase().includes('electric') && machineryType.toLowerCase().includes('rope') && machineryType.toLowerCase().includes('shovel');
    
    if (!isElectricRopeShovel) return null;

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Carga Útil del Balde</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>45 ton</Text>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={45}
              maximumValue={110}
              value={bucketCapacity}
              onValueChange={setBucketCapacity}
              minimumTrackTintColor="#0EA5E9"
              maximumTrackTintColor="#E2E8F0"
              thumbStyle={styles.sliderThumb}
            />
          </View>
          <Text style={styles.priceLabel}>110 ton</Text>
        </View>
        <Text style={styles.currentPrice}>{Math.round(bucketCapacity)} ton</Text>
      </View>
    );
  };

  const renderAttachmentSelector = () => {
    const isBackhoeLoader = machineryType.toLowerCase().includes('backhoe') || machineryType.toLowerCase().includes('loader');
    const isColdPlaner = machineryType.toLowerCase().includes('cold') || machineryType.toLowerCase().includes('planer');
    const isCompactor = machineryType.toLowerCase().includes('compactor');
    const isDozer = machineryType.toLowerCase().includes('dozer');
    const isDragline = machineryType.toLowerCase().includes('dragline');
    const isDrill = machineryType.toLowerCase().includes('drill');
    const isExcavator = machineryType.toLowerCase().includes('excavator');
    const isForestMachine = machineryType.toLowerCase().includes('forest');
    const isHydraulicMiningShovel = machineryType.toLowerCase().includes('hydraulic') && machineryType.toLowerCase().includes('mining') && machineryType.toLowerCase().includes('shovel');
    
    if (isBackhoeLoader) {
      return (
        <>
          {renderOptionSelector('Backhoe Rear Buckets', backhoeRearBuckets, selectedAttachment, setSelectedAttachment)}
          {renderOptionSelector('Backhoe Front Buckets', backhoeFrontBuckets, selectedAttachment, setSelectedAttachment)}
        </>
      );
    } else if (isColdPlaner) {
      return renderOptionSelector('Accesorios', coldPlanerAttachments, selectedAttachment, setSelectedAttachment);
    } else if (isCompactor) {
      return renderOptionSelector('Accesorios', compactorAttachments, selectedAttachment, setSelectedAttachment);
    } else if (isDozer) {
      return renderOptionSelector('Accesorios', dozerAttachments, selectedAttachment, setSelectedAttachment);
    } else if (isDragline) {
      return renderOptionSelector('Accesorios', draglineAttachments, selectedAttachment, setSelectedAttachment);
    } else if (isDrill) {
      return renderOptionSelector('Accesorios', drillAttachments, selectedAttachment, setSelectedAttachment);
    } else if (isExcavator) {
      return renderOptionSelector('Tipo de Balde', excavatorBuckets, selectedAttachment, setSelectedAttachment);
    } else if (isForestMachine) {
      return renderOptionSelector('Accesorios Forestales', forestMachineAttachments, selectedAttachment, setSelectedAttachment);
    } else if (isHydraulicMiningShovel) {
      return renderOptionSelector('Accesorios de Minería', hydraulicMiningShovelAttachments, selectedAttachment, setSelectedAttachment);
    } else {
      return renderOptionSelector('Accesorios', standardAttachments, selectedAttachment, setSelectedAttachment);
    }
  };

  const renderOptionSelector = (title: string, options: string[], selected: string, onSelect: (option: string) => void) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsGrid}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.optionCard, selected === option && styles.selectedOption]}
            onPress={() => onSelect(option)}
          >
            <Text style={[styles.optionText, selected === option && styles.selectedOptionText]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBackhoeAttachmentSelector = () => {
    const isBackhoeLoader = machineryType.toLowerCase().includes('backhoe') || machineryType.toLowerCase().includes('loader');
    
    if (isBackhoeLoader) {
      return (
        <>
          {renderOptionSelector('Backhoe Rear Buckets', backhoeRearBuckets, selectedAttachment, setSelectedAttachment)}
          {renderOptionSelector('Backhoe Front Buckets', backhoeFrontBuckets, selectedAttachment, setSelectedAttachment)}
        </>
      );
    } else {
      return renderOptionSelector('Accesorios', standardAttachments, selectedAttachment, setSelectedAttachment);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{machineryType}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderModelSelector()}
          {renderScreedWidthSelector()}
          {renderMillingWidthSelector()}
          {renderDrillSpecSelectors()}
          {renderDraglineSpecSelectors()}
          {renderElectricRopeShovelSpecSelectors()}
          {renderHydraulicMiningShovelSpecSelectors()}
          {renderAttachmentSelector()}

          <PriceRangeSelector
            price={priceRange}
            onPriceChange={setPriceRange}
            unitRate={unitRate}
            onUnitRateChange={setUnitRate}
            defaultRate={defaultRate}
          />
        </ScrollView>


        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.requestButton, isLoading && styles.disabledButton]} 
            onPress={handleRequestQuote}
            disabled={isLoading}
          >
            <Text style={styles.requestButtonText}>
              {isLoading ? 'Buscando...' : 'Solicitar Cotización'}
            </Text>
          </TouchableOpacity>
        </View>


        {showResults && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <TouchableOpacity onPress={() => setShowResults(false)} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#64748B" />
              </TouchableOpacity>
              <Text style={styles.resultsTitle}>Maquinaria Disponible</Text>
              <View style={styles.placeholder} />
            </View>
            <SortFilterBar
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
            <FlatList
              data={filteredAndSortedResults}
              renderItem={({ item }) => (
                <MachineryResultCard
                  machinery={item}
                  unitRate={unitRate}
                  onPress={() => console.log('Machinery selected:', item.id)}
                />
              )}

              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
              onEndReached={loadMoreMachinery}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isLoading && hasMore ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0EA5E9" />
                  </View>
                ) : null
              }
              ListEmptyComponent={
                !isLoading ? (
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <Ionicons name="search-outline" size={64} color="#CBD5E1" />
                    <Text style={{ fontSize: 18, color: '#64748B', marginTop: 16, textAlign: 'center' }}>
                      No se encontró maquinaria disponible
                    </Text>
                    <Text style={{ fontSize: 14, color: '#94A3B8', marginTop: 8, textAlign: 'center', marginBottom: 16 }}>
                      Intenta ajustar los filtros de búsqueda
                    </Text>
                    <TouchableOpacity 
                      style={styles.refreshButton}
                      onPress={handleRequestQuote}
                    >
                      <Ionicons name="refresh" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.refreshButtonText}>Refrescar</Text>
                    </TouchableOpacity>
                  </View>
                ) : null
              }

            />

          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionContainer: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: '45%',
  },
  selectedOption: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  optionText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  sliderContainer: {
    flex: 1,
  },
  slider: {
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#0EA5E9',
    width: 20,
    height: 20,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0EA5E9',
    textAlign: 'center',
    marginTop: 12,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  requestButton: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modelGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  modelCard: {
    flex: 1,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedModelCard: {
    borderColor: '#0EA5E9',
  },
  modelImageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modelImage: {
    borderRadius: 10,
  },
  modelOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  selectedModelText: {
    color: '#0EA5E9',
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
  },
  resultsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8FAFC',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  resultsList: {
    paddingVertical: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});