import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import HorizontalActiveSitesCarouselWithSelection from '../components/HorizontalActiveSitesCarouselWithSelection';
import ConstructionLogPanel from '../components/ConstructionLogPanel';
import AnimatedPortfolioPanel from '../components/AnimatedPortfolioPanel';
import PortfolioServicePanel from '../components/PortfolioServicePanel';
import SiteDocumentsAccess from '../components/SiteDocumentsAccess';

interface Site {
  id: string;
  name: string;
  location: string;
  status: string;
  progress: number;
  workers: any[];
  concepts: any[];
}

export default function ClientCommunityTab() {
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [selectedSiteName, setSelectedSiteName] = useState<string>('');
  const [showPortfolio, setShowPortfolio] = useState<boolean>(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const handleSiteSelect = (site: Site) => {
    try {
      setSelectedSiteId(site.id);
      setSelectedSiteName(site.name);
      setSelectedSite(site);
      setShowPortfolio(true);
    } catch (error) {
      console.log('Error selecting site:', error);
      // Fallback to safe state
      setSelectedSiteId('');
      setSelectedSiteName('');
      setSelectedSite(null);
      setShowPortfolio(false);
    }
  };

  const handlePortfolioToggle = () => {
    setShowPortfolio(!showPortfolio);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <HorizontalActiveSitesCarouselWithSelection 
        selectedSiteId={selectedSiteId}
        onSiteSelect={handleSiteSelect}
      />
      
      {selectedSiteId && selectedSiteName && (
        <>
          <SiteDocumentsAccess 
            siteId={selectedSiteId}
            siteName={selectedSiteName}
          />
          <AnimatedPortfolioPanel isVisible={showPortfolio}>
            <PortfolioServicePanel 
              siteId={selectedSiteId}
              siteName={selectedSiteName}
              onToggle={handlePortfolioToggle}
            />
          </AnimatedPortfolioPanel>
          <ConstructionLogPanel 
            siteId={selectedSiteId}
            siteName={selectedSiteName}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});