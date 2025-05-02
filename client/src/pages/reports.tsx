import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { ReportData } from "@/types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  TooltipProps
} from "recharts";
import { Download, RefreshCw } from "lucide-react";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("revenue");
  
  const { data, isLoading, error, refetch } = useQuery<ReportData>({
    queryKey: ['/api/reports'],
  });

  const handleExport = () => {
    // In a real app, this would generate and download a PDF or CSV report
    alert("This feature will export the report as a PDF or CSV file. Coming soon!");
  };

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Reports</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">Error loading reports</h3>
              <p className="text-gray-500 mb-4">
                We couldn't load the report data. Please try again.
              </p>
              <Button onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Reports</h1>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "revenue" && "Monthly Revenue"}
              {activeTab === "jobs" && "Jobs Per Month"}
              {activeTab === "clients" && "Revenue by Client"}
              {activeTab === "status" && "Job Status Distribution"}
            </CardTitle>
            <CardDescription>
              {activeTab === "revenue" && "Revenue trends over the last 6 months"}
              {activeTab === "jobs" && "Number of new jobs over the last 6 months"}
              {activeTab === "clients" && "Top clients by revenue"}
              {activeTab === "status" && "Current jobs by status"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-[300px] w-full" />
              </div>
            ) : data ? (
              <div className="h-[300px]">
                {activeTab === "revenue" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.revenuePerMonth}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        name="Revenue"
                        stroke="hsl(var(--chart-1))"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
                
                {activeTab === "jobs" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.jobsPerMonth}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="count"
                        name="Jobs"
                        fill="hsl(var(--chart-2))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                
                {activeTab === "clients" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.clientDistribution}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                      <Legend />
                      <Bar
                        dataKey="value"
                        name="Revenue"
                        fill="hsl(var(--chart-3))"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                
                {activeTab === "status" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Jobs"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
            <CardDescription>Key metrics from your data</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : data ? (
              <div className="space-y-6">
                {activeTab === "revenue" && (
                  <>
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-1">Total Revenue (6 months)</h3>
                      <p className="text-2xl font-bold">
                        {formatCurrency(data.revenuePerMonth.reduce((acc, month) => acc + month.amount, 0))}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-1">Highest Month</h3>
                      <p className="text-xl font-medium">
                        {(() => {
                          const highestMonth = [...data.revenuePerMonth].sort((a, b) => b.amount - a.amount)[0];
                          return `${highestMonth.month}: ${formatCurrency(highestMonth.amount)}`;
                        })()}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-1">Average Monthly Revenue</h3>
                      <p className="text-xl font-medium">
                        {formatCurrency(data.revenuePerMonth.reduce((acc, month) => acc + month.amount, 0) / data.revenuePerMonth.length)}
                      </p>
                    </div>
                  </>
                )}
                
                {activeTab === "jobs" && (
                  <>
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-1">Total Jobs (6 months)</h3>
                      <p className="text-2xl font-bold">
                        {data.jobsPerMonth.reduce((acc, month) => acc + month.count, 0)}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-1">Busiest Month</h3>
                      <p className="text-xl font-medium">
                        {(() => {
                          const busiestMonth = [...data.jobsPerMonth].sort((a, b) => b.count - a.count)[0];
                          return `${busiestMonth.month}: ${busiestMonth.count} jobs`;
                        })()}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-1">Average Jobs Per Month</h3>
                      <p className="text-xl font-medium">
                        {(data.jobsPerMonth.reduce((acc, month) => acc + month.count, 0) / data.jobsPerMonth.length).toFixed(1)}
                      </p>
                    </div>
                  </>
                )}
                
                {activeTab === "clients" && (
                  <>
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-1">Top Client</h3>
                      <p className="text-xl font-medium">
                        {data.clientDistribution[0]?.name || "No clients"}
                      </p>
                      <p className="text-lg font-medium text-primary">
                        {data.clientDistribution[0] ? formatCurrency(data.clientDistribution[0].value) : "-"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-1">Total Client Revenue</h3>
                      <p className="text-xl font-medium">
                        {formatCurrency(data.clientDistribution.reduce((acc, client) => acc + client.value, 0))}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-1">Client Distribution</h3>
                      <ul className="space-y-2">
                        {data.clientDistribution.map((client, index) => (
                          <li key={index} className="flex justify-between items-center">
                            <span>{client.name}</span>
                            <span className="font-medium">{formatCurrency(client.value)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
                
                {activeTab === "status" && (
                  <>
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-1">Total Jobs</h3>
                      <p className="text-2xl font-bold">
                        {data.statusDistribution.reduce((acc, status) => acc + status.value, 0)}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-1">Completion Rate</h3>
                      <p className="text-xl font-medium">
                        {(() => {
                          const total = data.statusDistribution.reduce((acc, status) => acc + status.value, 0);
                          const completed = data.statusDistribution.find(s => s.name === "Completed")?.value || 0;
                          return total ? `${Math.round((completed / total) * 100)}%` : "0%";
                        })()}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-1">Status Breakdown</h3>
                      <ul className="space-y-2">
                        {data.statusDistribution.map((status, index) => (
                          <li key={index} className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: status.color }}
                              ></div>
                              <span>{status.name}</span>
                            </div>
                            <span className="font-medium">{status.value} jobs</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
