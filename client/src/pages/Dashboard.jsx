import KPI from '../components/KPI'
import RealtimeCharts from '../components/RealtimeCharts'
import HealthGauge from '../components/HealthGauge'
import AlertsTable from '../components/AlertsTable'

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      <div className="grid md:grid-cols-4 gap-6">
        <KPI label="Total Machines" value={24} />
        <KPI label="Normal" value={18} accent="text-green-400" />
        <KPI label="Faulty" value={2} accent="text-red-400" />
        <KPI label="Avg RUL" value={72} suffix="h" accent="text-cyan-300" />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2"><RealtimeCharts/></div>
        <HealthGauge score={76} />
      </div>
      <AlertsTable />
    </div>
  )
}


