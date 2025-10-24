import { Site, PortfolioKPIs, SitePerformance, ConstructionConcept } from '../types';

export class PortfolioService {
  static calculatePortfolioKPIs(sites: Site[]): PortfolioKPIs {
    const activeSites = sites.filter(site => site.status === 'active');
    const totalBudget = sites.reduce((sum, site) => sum + site.total_budget, 0);
    const spentBudget = sites.reduce((sum, site) => sum + site.spent_budget, 0);
    
    // Calculate average output rate by trade
    const tradeOutputs: { [trade: string]: number[] } = {};
    const allConcepts = sites.flatMap(site => site.concepts);
    
    allConcepts.forEach(concept => {
      if (!tradeOutputs[concept.trade]) tradeOutputs[concept.trade] = [];
      if (concept.benchmarking_metrics) {
        tradeOutputs[concept.trade].push(concept.benchmarking_metrics.unit_output_rate);
      }
    });
    
    const avgOutputRate: { [trade: string]: number } = {};
    Object.keys(tradeOutputs).forEach(trade => {
      const outputs = tradeOutputs[trade];
      avgOutputRate[trade] = outputs.length > 0 ? outputs.reduce((a, b) => a + b, 0) / outputs.length : 0;
    });
    
    // Calculate delay metrics
    const delayedConcepts = allConcepts.filter(c => c.delay_info?.is_delayed);
    const totalDelayDays = delayedConcepts.reduce((sum, c) => sum + (c.delay_info?.delay_days || 0), 0);
    const avgDelayDaysPerSite = activeSites.length > 0 ? totalDelayDays / activeSites.length : 0;
    
    // Calculate on-time completion rate
    const completedConcepts = allConcepts.filter(c => c.status === 'completed');
    const onTimeConcepts = completedConcepts.filter(c => !c.delay_info?.is_delayed);
    const conceptsCompletedOnTimePct = completedConcepts.length > 0 ? (onTimeConcepts.length / completedConcepts.length) * 100 : 0;
    
    // Calculate worker utilization
    const totalWorkers = sites.reduce((sum, site) => sum + site.worker_count, 0);
    const activeWorkers = activeSites.reduce((sum, site) => sum + site.worker_count, 0);
    const workerUtilizationRate = totalWorkers > 0 ? (activeWorkers / totalWorkers) * 100 : 0;
    
    return {
      active_sites: activeSites.length,
      avg_output_rate: avgOutputRate,
      avg_delay_days_per_site: avgDelayDaysPerSite,
      total_budget: totalBudget,
      spent_budget: spentBudget,
      concepts_completed_on_time_pct: conceptsCompletedOnTimePct,
      worker_utilization_rate: workerUtilizationRate
    };
  }
  
  static getSitePerformanceData(sites: Site[]): SitePerformance[] {
    return sites.map(site => {
      const concepts = site.concepts;
      const completedConcepts = concepts.filter(c => c.status === 'completed');
      const onTimeConcepts = completedConcepts.filter(c => !c.delay_info?.is_delayed);
      const delayedConcepts = concepts.filter(c => c.delay_info?.is_delayed);
      const totalDelayDays = delayedConcepts.reduce((sum, c) => sum + (c.delay_info?.delay_days || 0), 0);
      
      // Calculate average output rate for site
      const outputRates = concepts
        .filter(c => c.benchmarking_metrics)
        .map(c => c.benchmarking_metrics!.unit_output_rate);
      const avgOutputRate = outputRates.length > 0 ? outputRates.reduce((a, b) => a + b, 0) / outputRates.length : 0;
      
      return {
        site_id: site.id,
        site_name: site.name,
        region: site.region,
        output_rate: avgOutputRate,
        delay_days: totalDelayDays,
        budget_utilization: site.total_budget > 0 ? (site.spent_budget / site.total_budget) * 100 : 0,
        worker_count: site.worker_count,
        concepts_completed: completedConcepts.length,
        concepts_on_time: onTimeConcepts.length
      };
    });
  }
  
  static getRegionDelayDistribution(sites: Site[]): { [region: string]: number } {
    const regionDelays: { [region: string]: number } = {};
    
    sites.forEach(site => {
      if (!regionDelays[site.region]) regionDelays[site.region] = 0;
      const siteDelays = site.concepts
        .filter(c => c.delay_info?.is_delayed)
        .reduce((sum, c) => sum + (c.delay_info?.delay_days || 0), 0);
      regionDelays[site.region] += siteDelays;
    });
    
    return regionDelays;
  }
  
  static getCostOverrunData(sites: Site[]): { site_id: string; site_name: string; overrun_pct: number }[] {
    return sites.map(site => ({
      site_id: site.id,
      site_name: site.name,
      overrun_pct: site.total_budget > 0 ? Math.max(0, ((site.spent_budget - site.total_budget) / site.total_budget) * 100) : 0
    }));
  }
  
  static getTopContractors(contractors: { id: string; name: string; sites: Site[] }[]): any[] {
    return contractors.map(contractor => {
      const kpis = this.calculatePortfolioKPIs(contractor.sites);
      const efficiency = kpis.concepts_completed_on_time_pct;
      
      return {
        id: contractor.id,
        name: contractor.name,
        site_count: contractor.sites.length,
        efficiency: efficiency,
        labor_utilization: kpis.worker_utilization_rate,
        total_budget: kpis.total_budget
      };
    }).sort((a, b) => b.efficiency - a.efficiency);
  }
}