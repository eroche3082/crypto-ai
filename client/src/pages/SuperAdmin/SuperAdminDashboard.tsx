import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Briefcase,
  BarChart3, 
  Users, 
  Settings, 
  CreditCard, 
  Bell, 
  Globe, 
  Server, 
  LogOut,
  ChevronRight,
  PieChart,
  DollarSign,
  User,
  LifeBuoy,
  Wallet,
  Shield,
  Sliders,
  Layers,
  Bot,
  CircleAlert,
  Database
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const SuperAdminDashboard = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Simular cierre de sesión
  const handleLogout = () => {
    toast({
      title: "Cerrando sesión",
      description: "Finalizando sesión de Super Admin...",
    });
    
    setTimeout(() => {
      setLocation('/superadmin');
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-card border-r">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center gap-2 px-4 mb-6">
            <div className="bg-primary/10 text-primary p-2 rounded-full">
              <Shield size={20} />
            </div>
            <div className="flex flex-col">
              <h2 className="font-semibold text-lg">Super Admin</h2>
              <span className="text-xs text-muted-foreground">Panel Global</span>
            </div>
          </div>

          <Separator className="mb-4" />
          
          <div className="flex flex-col space-y-1 px-3">
            <Button
              variant={activeTab === 'overview' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('overview')}
            >
              <PieChart size={18} className="mr-2" />
              Dashboard
            </Button>
            
            <Button
              variant={activeTab === 'finance' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('finance')}
            >
              <DollarSign size={18} className="mr-2" />
              Finanzas
            </Button>
            
            <Button
              variant={activeTab === 'users' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('users')}
            >
              <User size={18} className="mr-2" />
              Usuarios
            </Button>
            
            <Button
              variant={activeTab === 'memberships' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('memberships')}
            >
              <Briefcase size={18} className="mr-2" />
              Membresías
            </Button>
            
            <Button
              variant={activeTab === 'agents' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('agents')}
            >
              <Bot size={18} className="mr-2" />
              Agentes IA
            </Button>
            
            <Button
              variant={activeTab === 'system' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('system')}
            >
              <Sliders size={18} className="mr-2" />
              Configuración
            </Button>
            
            <Button
              variant={activeTab === 'incidents' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('incidents')}
            >
              <CircleAlert size={18} className="mr-2" />
              Alertas
              <Badge variant="destructive" className="ml-auto">3</Badge>
            </Button>
            
            <Button
              variant={activeTab === 'database' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('database')}
            >
              <Database size={18} className="mr-2" />
              Base de datos
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-2" />
            Cerrar sesión
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
              <Button size="sm" variant="outline">
                <Bell size={16} className="mr-2" />
                <span className="sr-only md:not-sr-only">Notificaciones</span>
              </Button>
              
              <Button size="sm" variant="outline">
                <Globe size={16} className="mr-2" />
                <span className="sr-only md:not-sr-only">Global</span>
              </Button>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User size={16} />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">La Capitana</p>
                  <p className="text-xs text-muted-foreground">Propietaria</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background/60">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            {/* Global Dashboard Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Dashboard Global</h2>
                <Button variant="outline">
                  Exportar informes
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Usuarios Totales
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12,847</div>
                    <p className="text-xs text-muted-foreground">
                      +18% desde el mes pasado
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Ingresos Mensuales
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$54,231</div>
                    <p className="text-xs text-muted-foreground">
                      +12.5% desde el mes pasado
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Aplicaciones Activas
                    </CardTitle>
                    <Layers className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">6</div>
                    <p className="text-xs text-muted-foreground">
                      CryptoBot, FitnessAI, JetAI...
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Estado del Sistema
                    </CardTitle>
                    <Server className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500">Estable</div>
                    <p className="text-xs text-muted-foreground">
                      99.98% de tiempo activo
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Análisis de tráfico por plataforma</CardTitle>
                    <CardDescription>
                      Distribución de usuarios activos por aplicación en tiempo real
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center bg-muted/30 rounded-md">
                      <BarChart3 className="h-16 w-16 text-muted-foreground opacity-30" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Actividad reciente</CardTitle>
                    <CardDescription>
                      Eventos del sistema en las últimas 24 horas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { time: '1 min', event: 'Nuevo usuario registrado en CryptoBot', icon: <User size={14} /> },
                        { time: '15 min', event: 'Actualización de API completada', icon: <Server size={14} /> },
                        { time: '2 horas', event: 'Alerta de seguridad resuelta', icon: <Shield size={14} /> },
                        { time: '4 horas', event: 'Transacción de $1,250 procesada', icon: <Wallet size={14} /> },
                        { time: '1 día', event: 'Nuevo agente IA desplegado', icon: <Bot size={14} /> },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {item.icon}
                          </div>
                          <div className="flex flex-col">
                            <p className="text-sm">{item.event}</p>
                            <p className="text-xs text-muted-foreground">Hace {item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Finance Tab */}
            <TabsContent value="finance" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Finanzas</h2>
                <div className="flex gap-2">
                  <Button variant="outline">
                    Exportar CSV
                  </Button>
                  <Button variant="default">
                    Ver reportes
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen financiero</CardTitle>
                    <CardDescription>
                      Datos consolidados de todas las plataformas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ingresos totales</span>
                        <span className="font-medium">$324,521.48</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Último mes</span>
                        <span className="font-medium">$54,231.25</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Membresías activas</span>
                        <span className="font-medium">4,235</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transacciones recientes</span>
                        <span className="font-medium">1,243</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor promedio</span>
                        <span className="font-medium">$47.85</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Por plataforma</CardTitle>
                    <CardDescription>
                      Distribución de ingresos por aplicación
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { name: 'CryptoBot', value: '$23,521.12', percent: '42%' },
                        { name: 'FitnessAI', value: '$12,433.55', percent: '23%' },
                        { name: 'JetAI', value: '$8,754.23', percent: '16%' },
                        { name: 'ShopAI', value: '$5,432.87', percent: '10%' },
                        { name: 'EduAI', value: '$4,089.48', percent: '9%' }
                      ].map((platform, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full bg-${i % 2 === 0 ? 'primary' : 'green-500'}`} />
                            <span>{platform.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{platform.percent}</span>
                            <span className="font-medium">{platform.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Cuentas bancarias</CardTitle>
                    <CardDescription>
                      Cuentas conectadas y saldos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { bank: 'Bancomer MX', account: '****8342', balance: '$124,532.25' },
                        { bank: 'Santander US', account: '****9764', balance: '$87,245.12' },
                        { bank: 'Chase', account: '****5231', balance: '$45,876.43' }
                      ].map((account, i) => (
                        <div key={i} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex flex-col">
                            <span className="font-medium">{account.bank}</span>
                            <span className="text-xs text-muted-foreground">{account.account}</span>
                          </div>
                          <span className="font-medium">{account.balance}</span>
                        </div>
                      ))}
                      
                      <Button variant="outline" className="w-full mt-2">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Agregar cuenta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Usuarios</h2>
                <Button variant="outline">
                  Exportar usuarios
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Base de usuarios global</CardTitle>
                  <CardDescription>
                    Gestión centralizada de todos los usuarios del ecosistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 p-4 font-medium border-b">
                      <div>Usuario</div>
                      <div>Plataforma</div>
                      <div>Membresía</div>
                      <div>Registro</div>
                      <div>Acciones</div>
                    </div>
                    <div className="divide-y">
                      {[
                        { name: 'Carlos Rodriguez', platform: 'CryptoBot', plan: 'Premium', date: '12/03/2024' },
                        { name: 'Marta Sánchez', platform: 'FitnessAI', plan: 'Basic', date: '05/02/2024' },
                        { name: 'Juan Pérez', platform: 'JetAI', plan: 'Pro', date: '28/01/2024' },
                        { name: 'Ana Gómez', platform: 'CryptoBot', plan: 'Premium', date: '15/03/2024' },
                        { name: 'Roberto Torres', platform: 'ShopAI', plan: 'Basic', date: '10/03/2024' },
                      ].map((user, i) => (
                        <div key={i} className="grid grid-cols-5 p-4 items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <User size={14} />
                            </div>
                            <span>{user.name}</span>
                          </div>
                          <div>{user.platform}</div>
                          <div>
                            <Badge variant={user.plan === 'Premium' ? 'default' : 'secondary'}>
                              {user.plan}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground">{user.date}</div>
                          <div>
                            <Button variant="ghost" size="sm">
                              Ver detalles
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 py-4">
                    <Button variant="outline" size="sm" disabled>
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm" className="px-3 font-medium bg-primary/10">
                      1
                    </Button>
                    <Button variant="outline" size="sm" className="px-3">
                      2
                    </Button>
                    <Button variant="outline" size="sm" className="px-3">
                      3
                    </Button>
                    <Button variant="outline" size="sm">
                      Siguiente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Configuration Tab */}
            <TabsContent value="system" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Configuración del Sistema</h2>
                <div className="flex gap-2">
                  <Button variant="outline">
                    Cancelar
                  </Button>
                  <Button>
                    Guardar cambios
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración general</CardTitle>
                    <CardDescription>
                      Ajustes globales del ecosistema de aplicaciones
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Tema global</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-primary/10">Claro</Button>
                        <Button variant="outline" size="sm">Oscuro</Button>
                        <Button variant="outline" size="sm">Sistema</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Idioma predeterminado</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-primary/10">Español</Button>
                        <Button variant="outline" size="sm">English</Button>
                        <Button variant="outline" size="sm">Português</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Región</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-primary/10">México</Button>
                        <Button variant="outline" size="sm">Estados Unidos</Button>
                        <Button variant="outline" size="sm">Otro</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Seguridad</CardTitle>
                    <CardDescription>
                      Controles de seguridad y acceso
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-medium">Autenticación de dos factores</h3>
                        <p className="text-xs text-muted-foreground">Requerir para todos los administradores</p>
                      </div>
                      <Button variant="outline" size="sm" className="bg-primary/10">
                        Activado
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-medium">Verificación biométrica</h3>
                        <p className="text-xs text-muted-foreground">Para acceso a panel de Super Admin</p>
                      </div>
                      <Button variant="outline" size="sm" className="bg-primary/10">
                        Requerido
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-medium">Registro de actividad</h3>
                        <p className="text-xs text-muted-foreground">Guardar historial de acciones administrativas</p>
                      </div>
                      <Button variant="outline" size="sm" className="bg-primary/10">
                        Activado
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Configuración de API</CardTitle>
                    <CardDescription>
                      Administración de claves de API y servicios externos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: 'Google Vertex AI', status: 'Conectado', lastUpdated: '10/04/2025' },
                        { name: 'Stripe', status: 'Conectado', lastUpdated: '05/04/2025' },
                        { name: 'CoinAPI', status: 'Conectado', lastUpdated: '12/03/2025' },
                        { name: 'OpenAI', status: 'Inactivo', lastUpdated: '01/03/2025' },
                        { name: 'News API', status: 'Conectado', lastUpdated: '15/03/2025' },
                      ].map((api, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${api.status === 'Conectado' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div>
                              <h4 className="font-medium">{api.name}</h4>
                              <p className="text-xs text-muted-foreground">Actualizado: {api.lastUpdated}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Configurar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Other tab contents would be implemented similarly */}
            <TabsContent value="memberships">
              <h2 className="text-2xl font-bold mb-4">Gestión de Membresías</h2>
              {/* Contenido de membresías */}
            </TabsContent>
            
            <TabsContent value="agents">
              <h2 className="text-2xl font-bold mb-4">Agentes IA</h2>
              {/* Contenido de agentes */}
            </TabsContent>
            
            <TabsContent value="incidents">
              <h2 className="text-2xl font-bold mb-4">Centro de Alertas</h2>
              {/* Contenido de alertas */}
            </TabsContent>
            
            <TabsContent value="database">
              <h2 className="text-2xl font-bold mb-4">Base de Datos</h2>
              {/* Contenido de base de datos */}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;