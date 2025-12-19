import KPI from '../components/KPI'
import RealtimeCharts from '../components/RealtimeCharts'
import HealthGauge from '../components/HealthGauge'
import AlertsTable from '../components/AlertsTable'

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Enhanced KPI Section */}
      <div className="grid md:grid-cols-4 gap-6">
        <KPI 
          label="Total Machines" 
          value={4} 
          trend={5.2}
          
        />
        <KPI 
          label="Normal Status" 
          value={3} 
          accent="text-green-400" 
          trend={-2.1}
          
        />
        <KPI 
          label="Faulty Machines" 
          value={1} 
          accent="text-red-400" 
          trend={1.5}
          
        />
        <KPI 
          label="Avg RUL" 
          value={72} 
          suffix="h" 
          accent="text-cyan-300" 
          trend={-3.2}
          
        />
      </div>
      
      {/* Enhanced Charts */}
      <RealtimeCharts/>
      
      {/* Machine Health Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HealthGauge score={76} machineId="M-1001" trend={2.1} />
        <HealthGauge score={82} machineId="M-1002" trend={-1.3} />
        <HealthGauge score={45} machineId="M-1003" trend={-5.7} />
        <HealthGauge score={91} machineId="M-1004" trend={0.8} />
      </div>
      
      {/* Live Alerts */}
      <AlertsTable />
    </div>
  )
}


