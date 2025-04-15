import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Layout, 
  Users, 
  Settings, 
  Bell, 
  Globe, 
  LogOut, 
  Sliders, 
  CheckCircle,
  Layers,
  PieChart,
  Tag,
  CreditCard,
  Lock,
  AlertTriangle,
  Database,
  Server,
  CloudCog,
  Activity,
  UserCog,
  Building,
  BarChart4,
  ShieldAlert,
  Video,
  User3dGlasses
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const SuperAdminDashboard = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Simular cierre de sesión
  const handleLogout = () => {
    toast({
      title: "Cerrando sesión",
      description: "Finalizando sesión de Super Administrador...",
    });
    
    setTimeout(() => {
      setLocation('/superadmin');
    }, 1000);
  };

  // Estado de la plataforma (simulado)
  const platformStatus = {
    usersTotal: 12458,
    activeUsers: 8342,
    transactions: 2350,
    revenue: 45820,
    cpuUsage: 32,
    memoryUsage: 48,
    storageUsage: 27,
    apiCalls: 238502,
    uptime: "99.98%"
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-card border-r">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center gap-2 px-4 mb-6">
            <div className="bg-destructive/90 text-destructive-foreground p-2 rounded-full">
              <ShieldAlert size={20} />
            </div>
            <div className="flex flex-col">
              <h2 className="font-semibold text-lg">Super Admin</h2>
              <span className="text-xs text-muted-foreground">Control total</span>
            </div>
          </div>

          <Separator className="mb-4" />
          
          <div className="flex flex-col space-y-1 px-3">
            <Button
              variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('dashboard')}
            >
              <PieChart size={18} className="mr-2" />
              Global Dashboard
            </Button>
            
            <Button
              variant={activeTab === 'finance' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('finance')}
            >
              <CreditCard size={18} className="mr-2" />
              Finance
            </Button>
            
            <Button
              variant={activeTab === 'security' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('security')}
            >
              <Lock size={18} className="mr-2" />
              Security
            </Button>
            
            <Button
              variant={activeTab === 'infrastructure' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('infrastructure')}
            >
              <Server size={18} className="mr-2" />
              Infrastructure
            </Button>
            
            <Button
              variant={activeTab === 'admins' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('admins')}
            >
              <UserCog size={18} className="mr-2" />
              Admin Management
            </Button>
            
            <Button
              variant={activeTab === 'business' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('business')}
            >
              <Building size={18} className="mr-2" />
              Business
            </Button>
            
            <Button
              variant={activeTab === 'avatars' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('avatars')}
            >
              <User3D size={18} className="mr-2" />
              3D Avatars
            </Button>
            
            <Button
              variant={activeTab === 'editor' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('editor')}
            >
              <Sliders size={18} className="mr-2" />
              Visual Editor
            </Button>
          </div>

          <Separator className="my-4" />
          
          <div className="px-3">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground mb-2">SYSTEMS</h3>
            <div className="flex flex-col space-y-1">
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  toast({
                    title: "Acceso al sistema",
                    description: "Conectando con sistemas centrales...",
                  });
                }}
              >
                <CloudCog size={18} className="mr-2" />
                API Central
              </Button>
              
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  toast({
                    title: "Base de datos global",
                    description: "Accediendo a administración de datos...",
                  });
                }}
              >
                <Database size={18} className="mr-2" />
                Base de datos
              </Button>
              
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  toast({
                    title: "Logs del sistema",
                    description: "Accediendo a logs centralizados...",
                  });
                }}
              >
                <Activity size={18} className="mr-2" />
                Logs
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full justify-start text-destructive border-destructive"
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-2" />
            Log Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Top navigation */}
        <header className="bg-card shadow-sm border-b z-40">
          <div className="h-16 flex items-center justify-between px-4">
            <h1 className="text-lg font-semibold md:hidden">Super Admin</h1>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-red-500/10 text-red-500 hidden md:flex">
                Full Access
              </Badge>
              
              <Button size="sm" variant="outline">
                <Bell size={16} className="mr-2" />
                <span className="sr-only md:not-sr-only">Alerts</span>
              </Button>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">
                  <ShieldAlert size={16} />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">Super Administrator</p>
                  <p className="text-xs text-muted-foreground">Full Privileges</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background/60">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            {/* DASHBOARD TAB */}
            <TabsContent value="dashboard" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Global Dashboard</h2>
                <div className="flex gap-2">
                  <Badge variant="outline" className="gap-1 items-center text-green-500 bg-green-500/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    System Online
                  </Badge>
                  <Button variant="default">
                    Full Report
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{platformStatus.usersTotal.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {platformStatus.activeUsers.toLocaleString()} currently active
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Transactions
                    </CardTitle>
                    <BarChart4 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{platformStatus.transactions.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Last 24 hours
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Revenue
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${platformStatus.revenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      +12% since last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Uptime
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{platformStatus.uptime}</div>
                    <p className="text-xs text-muted-foreground">
                      Last 30 days
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="md:col-span-4">
                  <CardHeader>
                    <CardTitle>Platform Global Analysis</CardTitle>
                    <CardDescription>
                      Status and performance of all systems
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Server size={16} />
                          <span>CPU</span>
                        </div>
                        <span className="text-sm font-medium">{platformStatus.cpuUsage}%</span>
                      </div>
                      <Progress value={platformStatus.cpuUsage} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Server size={16} />
                          <span>Memory</span>
                        </div>
                        <span className="text-sm font-medium">{platformStatus.memoryUsage}%</span>
                      </div>
                      <Progress value={platformStatus.memoryUsage} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Database size={16} />
                          <span>Storage</span>
                        </div>
                        <span className="text-sm font-medium">{platformStatus.storageUsage}%</span>
                      </div>
                      <Progress value={platformStatus.storageUsage} className="h-2" />
                    </div>
                    
                    <div className="pt-2">
                      <div className="rounded-lg border p-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">API Calls</h4>
                          <Badge variant="outline">{platformStatus.apiCalls.toLocaleString()}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Last 24 hours. Normal performance.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-3">
                  <CardHeader>
                    <CardTitle>System Alerts</CardTitle>
                    <CardDescription>
                      Incidents requiring priority attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-yellow-500">External API Connection Error</h4>
                            <p className="text-sm mt-1">Temporary connection issue with CoinAPI data provider.</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                                View Details
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                                Resolve
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-red-500">Memory Usage Spike</h4>
                            <p className="text-sm mt-1">Main instance reached 85% memory usage during traffic peak.</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                                View Details
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                                Resolve
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="rounded-lg border p-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Payment System Running Smoothly</h4>
                            <p className="text-sm text-muted-foreground mt-1">All payment gateways operating normally.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Administrative Activity</CardTitle>
                  <CardDescription>
                    Admin actions and system configurations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { 
                        action: "API Configuration", 
                        details: "Updated CoinAPI token", 
                        admin: "SuperAdmin", 
                        time: "2 hours ago" 
                      },
                      { 
                        action: "Pricing Change", 
                        details: "Modified 'Elite' plan from $19.99 to $24.99", 
                        admin: "Admin Manager", 
                        time: "5 hours ago" 
                      },
                      { 
                        action: "Server Restart", 
                        details: "Scheduled restart of main server", 
                        admin: "SuperAdmin", 
                        time: "1 day ago" 
                      },
                      { 
                        action: "UI Modification", 
                        details: "Updated homepage text content", 
                        admin: "Admin Manager", 
                        time: "2 days ago" 
                      },
                      { 
                        action: "Security Configuration", 
                        details: "Updated password policy", 
                        admin: "SuperAdmin", 
                        time: "3 days ago" 
                      },
                    ].map((log, i) => (
                      <div key={i} className="flex justify-between border-b pb-3 last:border-0 last:pb-0">
                        <div className="space-y-1">
                          <div className="font-medium">{log.action}</div>
                          <div className="text-sm text-muted-foreground">{log.details}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">{log.time}</div>
                          <div className="text-xs text-muted-foreground">By: {log.admin}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FINANCE TAB */}
            <TabsContent value="finance" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Finanzas</h2>
                <Button variant="outline">
                  Exportar datos
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Ingresos totales
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$152,432.65</div>
                    <p className="text-xs text-muted-foreground">
                      Últimos 30 días
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Transacciones
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">5,234</div>
                    <p className="text-xs text-muted-foreground">
                      +12% vs mes anterior
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Valor promedio
                    </CardTitle>
                    <BarChart4 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$29.12</div>
                    <p className="text-xs text-muted-foreground">
                      Por transacción
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de pagos</CardTitle>
                  <CardDescription>
                    Administrar métodos y procesadores de pago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">Stripe</h3>
                            <p className="text-sm text-muted-foreground">Procesador de pago principal</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">Activo</Badge>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">PayPal</h3>
                            <p className="text-sm text-muted-foreground">Procesador de pago alternativo</p>
                          </div>
                        </div>
                        <Badge variant="outline">Inactivo</Badge>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button variant="outline" className="w-full">
                        Configurar nuevo método de pago
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Información bancaria</CardTitle>
                    <CardDescription>
                      Datos de cuentas para liquidaciones
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg border p-3">
                        <h4 className="font-medium mb-2">Cuenta principal</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Banco:</span>
                            <span>Banco Internacional</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Titular:</span>
                            <span>CryptoBot Inc.</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Cuenta:</span>
                            <span>XXXX-XXXX-XXXX-4850</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Agregar cuenta
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Ciclo de facturación</CardTitle>
                    <CardDescription>
                      Configuración de periodos de facturación
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Cobrar automáticamente</span>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex justify-between">
                          <span>Enviar recibos por email</span>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex justify-between">
                          <span>Período de gracia</span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="pt-2">
                        <Button variant="outline" className="w-full">
                          Configurar parámetros avanzados
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Contenido de otras pestañas estaría aquí */}
            <TabsContent value="security" className="space-y-4">
              <h2 className="text-2xl font-bold">Seguridad</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Acceso y permisos</CardTitle>
                  <CardDescription>Gestión avanzada de acceso al sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Configuración de permisos, autenticación y acceso seguros</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="infrastructure" className="space-y-4">
              <h2 className="text-2xl font-bold">Infraestructura</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Servidores y recursos</CardTitle>
                  <CardDescription>Gestión de infraestructura y escalabilidad</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Administración de servidores, recursos y despliegue</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="admins" className="space-y-4">
              <h2 className="text-2xl font-bold">Gestión de Admins</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Administradores del sistema</CardTitle>
                  <CardDescription>Control de permisos y accesos administrativos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Gestión de usuarios administradores y permisos</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="business" className="space-y-4">
              <h2 className="text-2xl font-bold">Negocio</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Operaciones de negocio</CardTitle>
                  <CardDescription>Métricas y configuración corporativa</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Administración de aspectos comerciales y métricas de negocio</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="avatars" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">3D Avatars Management</h2>
                <Button 
                  variant="default"
                  onClick={() => setLocation('/superadmin/avatars')}
                >
                  Open Avatar Manager
                </Button>
              </div>
              
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Ready Player Me</CardTitle>
                    <CardDescription>
                      Integración con Ready Player Me para avatars 3D personalizados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Estado de la API</h4>
                          <Badge variant="outline" className="bg-green-500/10 text-green-500">
                            Activa
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Conexión con Ready Player Me configurada correctamente
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Avatars disponibles</span>
                        <Badge>12</Badge>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setLocation('/superadmin/avatars')}
                        >
                          <User3D size={16} className="mr-2" />
                          Gestionar avatars
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>AI Video Avatars</CardTitle>
                    <CardDescription>
                      Integración con servicios de video AI (Heygen, ElevenLabs, etc.)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Estado de integración</h4>
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                            Configuración pendiente
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Se requiere configurar las APIs de OpenAI, Heygen y ElevenLabs
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            toast({
                              title: "Configuración de APIs",
                              description: "Accediendo a configuración de servicios de IA...",
                            });
                          }}
                        >
                          <Video size={16} className="mr-2" />
                          Configurar servicios
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas de uso de avatars</CardTitle>
                  <CardDescription>
                    Métricas de utilización e interacción con avatars
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border p-3">
                      <h4 className="font-medium">Interacciones totales</h4>
                      <p className="text-2xl font-bold mt-1">1,245</p>
                      <p className="text-xs text-muted-foreground">Últimos 30 días</p>
                    </div>
                    
                    <div className="rounded-lg border p-3">
                      <h4 className="font-medium">Avatars más utilizados</h4>
                      <p className="text-2xl font-bold mt-1">3 de 12</p>
                      <p className="text-xs text-muted-foreground">Representan el 80% de uso</p>
                    </div>
                    
                    <div className="rounded-lg border p-3">
                      <h4 className="font-medium">Tiempo promedio de interacción</h4>
                      <p className="text-2xl font-bold mt-1">2:45 min</p>
                      <p className="text-xs text-muted-foreground">Por sesión de usuario</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* VISUAL EDITOR TAB */}
            <TabsContent value="editor" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Visual Editor System</h2>
                <Button 
                  variant="default"
                  onClick={() => setLocation('/editor')}
                >
                  Launch Visual Editor
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Live UI Customization</CardTitle>
                    <CardDescription>
                      Edit your platform design in real-time without code changes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Editor Status</h4>
                          <Badge variant="outline" className="bg-green-500/10 text-green-500">
                            Active
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Firestore-powered visual editor is ready for use
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Last updated</span>
                        <span className="text-sm">April 14, 2025</span>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setLocation('/editor')}
                        >
                          <Sliders size={16} className="mr-2" />
                          Customize UI Elements
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Features & Capabilities</CardTitle>
                    <CardDescription>
                      What you can modify with the visual editor
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Edit text elements (titles, subtitles, buttons)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Customize colors and typography</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Toggle visibility of sections</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Upload and replace images</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Edit navigation menu items</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Preview changes in real-time</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Protected Route</CardTitle>
                  <CardDescription>
                    Access control information for Visual Editor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>The Visual Editor is protected and only accessible to users with these roles:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border p-3">
                        <h4 className="font-medium">SuperAdmin</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Full access via QR authentication
                        </p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <h4 className="font-medium">Admin Manager</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Access via credentials login
                        </p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button 
                        variant="default" 
                        className="w-full"
                        onClick={() => setLocation('/editor')}
                      >
                        Access Visual Editor Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;