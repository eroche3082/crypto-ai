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
  Palette,
  Image as ImageIcon,
  Edit,
  User,
  Shield,
  MessageSquare,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  FileText,
  Filter,
  Table,
  ChevronRight
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AdminDashboard = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Simular cierre de sesión
  const handleLogout = () => {
    toast({
      title: "Cerrando sesión",
      description: "Finalizando sesión de administrador...",
    });
    
    setTimeout(() => {
      setLocation('/admin');
    }, 1000);
  };

  // Registro de acción para el SuperAdmin
  const logAdminAction = (action: string, details: string) => {
    // En una implementación real, esta acción se enviaría al backend
    console.log(`Admin Action: ${action}`, details);
    
    // Mostrar feedback al usuario
    toast({
      title: "Acción registrada",
      description: "Esta acción ha sido registrada en el sistema",
    });
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
              <h2 className="font-semibold text-lg">Admin Manager</h2>
              <span className="text-xs text-muted-foreground">Panel de control</span>
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
              Dashboard
            </Button>
            
            <Button
              variant={activeTab === 'ui-editor' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('ui-editor')}
            >
              <Palette size={18} className="mr-2" />
              Editor UI
            </Button>
            
            <Button
              variant={activeTab === 'memberships' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('memberships')}
            >
              <Tag size={18} className="mr-2" />
              Membresías
            </Button>
            
            <Button
              variant={activeTab === 'users' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('users')}
            >
              <Users size={18} className="mr-2" />
              Usuarios
            </Button>
            
            <Button
              variant={activeTab === 'features' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('features')}
            >
              <ToggleRight size={18} className="mr-2" />
              Features
            </Button>
            
            <Button
              variant={activeTab === 'system' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('system')}
            >
              <CheckCircle size={18} className="mr-2" />
              Integridad
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
            <h1 className="text-lg font-semibold md:hidden">Admin Manager</h1>
            
            <div className="flex items-center gap-4">
              <Button size="sm" variant="outline">
                <Bell size={16} className="mr-2" />
                <span className="sr-only md:not-sr-only">Alertas</span>
              </Button>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User size={16} />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">Administrador</p>
                  <p className="text-xs text-muted-foreground">admin</p>
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
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <Button variant="outline">
                  Generar informe
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Usuarios activos
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8,342</div>
                    <p className="text-xs text-muted-foreground">
                      +5% desde la semana pasada
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Interacciones chatbot
                    </CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">23,541</div>
                    <p className="text-xs text-muted-foreground">
                      +12% desde la semana pasada
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Features activos
                    </CardTitle>
                    <Layers className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">42</div>
                    <p className="text-xs text-muted-foreground">
                      8 nuevos este mes
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Alertas del sistema
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-500">3</div>
                    <p className="text-xs text-muted-foreground">
                      Requieren atención
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Actividad reciente</CardTitle>
                    <CardDescription>
                      Últimas acciones administrativas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { 
                          time: '10:45 AM', 
                          event: 'Editado texto en Homepage', 
                          user: 'admin' 
                        },
                        { 
                          time: '9:30 AM', 
                          event: 'Actualizada configuración de chatbot', 
                          user: 'admin' 
                        },
                        { 
                          time: 'Ayer', 
                          event: 'Activado módulo de NFT Explorer', 
                          user: 'admin' 
                        },
                        { 
                          time: 'Ayer', 
                          event: 'Actualización de membresías', 
                          user: 'admin' 
                        },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="text-sm font-medium">{item.event}</p>
                            <p className="text-xs text-muted-foreground">Por: {item.user}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Resumen de plataforma</CardTitle>
                    <CardDescription>
                      Estado actual del sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Estado de chatbot</span>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Activo</Badge>
                      </div>
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">API de criptomonedas</span>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Conectada</Badge>
                      </div>
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Servicios de IA</span>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Operativos</Badge>
                      </div>
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Módulo de membresías</span>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Activo</Badge>
                      </div>
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Sincronización de datos</span>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">Hace 24 hrs</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* UI EDITOR TAB */}
            <TabsContent value="ui-editor" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Editor de Interfaz</h2>
                <div className="flex gap-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button 
                    onClick={() => logAdminAction('UI update', 'Changed homepage UI elements')}
                  >
                    Guardar cambios
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Contenido de Homepage</CardTitle>
                    <CardDescription>
                      Edita textos y elementos visuales
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="hero-title">Título principal</Label>
                      <Input 
                        id="hero-title" 
                        defaultValue="CryptoBot: Inteligencia cripto avanzada" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="hero-subtitle">Subtítulo</Label>
                      <Input 
                        id="hero-subtitle" 
                        defaultValue="Análisis avanzado con IA para tus inversiones" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cta-text">Texto de CTA</Label>
                      <Input 
                        id="cta-text" 
                        defaultValue="Empieza a invertir inteligentemente" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center justify-between">
                        <span>Hero Image</span>
                        <Button variant="outline" size="sm">
                          <ImageIcon size={14} className="mr-1" />
                          Cambiar
                        </Button>
                      </Label>
                      <div className="border rounded-md p-2">
                        <div className="bg-muted/30 h-32 flex items-center justify-center rounded">
                          <ImageIcon className="h-8 w-8 text-muted" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Personalización de UI</CardTitle>
                    <CardDescription>
                      Configura colores y elementos de diseño
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tema de la aplicación</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-primary/10">Claro</Button>
                        <Button variant="outline" size="sm">Oscuro</Button>
                        <Button variant="outline" size="sm">Sistema</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Color primario</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500", "bg-rose-500"].map((color, i) => (
                          <div 
                            key={i} 
                            className={`${color} h-8 rounded-md cursor-pointer ${i === 0 ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tamaño de fuente</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Pequeña</Button>
                        <Button variant="outline" size="sm" className="bg-primary/10">Mediana</Button>
                        <Button variant="outline" size="sm">Grande</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Elementos visibles</Label>
                      <div className="space-y-2">
                        {[
                          { label: "Banner de bienvenida", checked: true },
                          { label: "NFT showcase", checked: true },
                          { label: "Gráficos en tiempo real", checked: true },
                          { label: "Bloque de testimonios", checked: false },
                          { label: "Footer extendido", checked: true },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-sm">{item.label}</span>
                            <Switch defaultChecked={item.checked} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* MEMBERSHIPS TAB */}
            <TabsContent value="memberships" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Gestión de Membresías</h2>
                <Button 
                  onClick={() => {
                    toast({
                      title: "Función disponible",
                      description: "Puedes crear nuevas membresías desde aquí",
                    });
                    logAdminAction('Membership access', 'Viewed membership management page');
                  }}
                >
                  + Nueva membresía
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Planes de membresía</CardTitle>
                  <CardDescription>
                    Administra los planes disponibles y sus características
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 p-4 font-medium border-b">
                      <div>Nombre del plan</div>
                      <div>Precio</div>
                      <div>Nivel de acceso</div>
                      <div>Estado</div>
                      <div>Acciones</div>
                    </div>
                    <div className="divide-y">
                      {[
                        { name: "Free", price: "$0", level: "Básico", active: true },
                        { name: "Pro", price: "$9.99", level: "Intermedio", active: true },
                        { name: "Elite", price: "$19.99", level: "Avanzado", active: true },
                        { name: "VIP", price: "$49.99", level: "Premium", active: false },
                      ].map((plan, i) => (
                        <div key={i} className="grid grid-cols-5 p-4 items-center">
                          <div className="font-medium">{plan.name}</div>
                          <div>{plan.price}/mes</div>
                          <div>
                            <Badge variant={
                              plan.level === "Básico" ? "outline" :
                              plan.level === "Intermedio" ? "secondary" :
                              plan.level === "Avanzado" ? "default" : "destructive"
                            }>
                              {plan.level}
                            </Badge>
                          </div>
                          <div>
                            <Badge variant={plan.active ? "outline" : "secondary"} className={plan.active ? "bg-green-500/10 text-green-500" : ""}>
                              {plan.active ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => 
                              logAdminAction('Membership edit', `Edited ${plan.name} membership`)
                            }>
                              <Edit size={14} className="mr-1" />
                              Editar
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => 
                              logAdminAction('Membership status', `Changed ${plan.name} status to ${!plan.active ? 'active' : 'inactive'}`)
                            }>
                              {plan.active ? (
                                <ToggleRight size={14} className="mr-1 text-green-500" />
                              ) : (
                                <ToggleLeft size={14} className="mr-1" />
                              )}
                              {plan.active ? "Desactivar" : "Activar"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Características por plan</CardTitle>
                  <CardDescription>
                    Configura qué características están disponibles en cada plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="px-4 py-2 text-left">Característica</th>
                          <th className="px-4 py-2 text-center">Free</th>
                          <th className="px-4 py-2 text-center">Pro</th>
                          <th className="px-4 py-2 text-center">Elite</th>
                          <th className="px-4 py-2 text-center">VIP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { feature: "Dashboard básico", free: true, pro: true, elite: true, vip: true },
                          { feature: "Análisis de mercado", free: true, pro: true, elite: true, vip: true },
                          { feature: "Chatbot AI", free: false, pro: true, elite: true, vip: true },
                          { feature: "Predicciones avanzadas", free: false, pro: false, elite: true, vip: true },
                          { feature: "NFT Explorer", free: false, pro: true, elite: true, vip: true },
                          { feature: "Consultas ilimitadas", free: false, pro: false, elite: true, vip: true },
                          { feature: "Soporte prioritario", free: false, pro: false, elite: false, vip: true },
                          { feature: "Alertas personalizadas", free: false, pro: true, elite: true, vip: true },
                        ].map((item, i) => (
                          <tr key={i} className="border-b">
                            <td className="px-4 py-2">{item.feature}</td>
                            <td className="px-4 py-2 text-center">
                              <Switch defaultChecked={item.free} onCheckedChange={() => 
                                logAdminAction('Feature toggle', `Changed ${item.feature} availability for Free plan`)
                              } />
                            </td>
                            <td className="px-4 py-2 text-center">
                              <Switch defaultChecked={item.pro} onCheckedChange={() => 
                                logAdminAction('Feature toggle', `Changed ${item.feature} availability for Pro plan`)
                              } />
                            </td>
                            <td className="px-4 py-2 text-center">
                              <Switch defaultChecked={item.elite} onCheckedChange={() => 
                                logAdminAction('Feature toggle', `Changed ${item.feature} availability for Elite plan`)
                              } />
                            </td>
                            <td className="px-4 py-2 text-center">
                              <Switch defaultChecked={item.vip} onCheckedChange={() => 
                                logAdminAction('Feature toggle', `Changed ${item.feature} availability for VIP plan`)
                              } />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* USERS TAB */}
            <TabsContent value="users" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Input placeholder="Buscar usuarios..." className="pl-8 w-60" />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-muted-foreground">
                      <Filter size={16} />
                    </div>
                  </div>
                  <Button variant="outline">Exportar</Button>
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Base de usuarios</CardTitle>
                  <CardDescription>
                    Administra usuarios y sus permisos (información no financiera)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 p-4 font-medium border-b">
                      <div>Usuario</div>
                      <div>Fecha de registro</div>
                      <div>Plan</div>
                      <div>Estado</div>
                      <div>Acciones</div>
                    </div>
                    <div className="divide-y">
                      {[
                        { name: "Carlos Rodríguez", email: "carlos@example.com", date: "12/03/2024", plan: "Pro", active: true },
                        { name: "Marta Sánchez", email: "marta@example.com", date: "05/02/2024", plan: "Free", active: true },
                        { name: "Juan Pérez", email: "juan@example.com", date: "28/01/2024", plan: "Elite", active: true },
                        { name: "Ana Gómez", email: "ana@example.com", date: "15/03/2024", plan: "Pro", active: false },
                        { name: "Roberto Torres", email: "roberto@example.com", date: "10/03/2024", plan: "Free", active: true },
                      ].map((user, i) => (
                        <div key={i} className="grid grid-cols-5 p-4 items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <User size={14} />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{user.name}</span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                          </div>
                          <div className="text-muted-foreground">{user.date}</div>
                          <div>
                            <Badge variant={
                              user.plan === "Free" ? "outline" :
                              user.plan === "Pro" ? "secondary" : "default"
                            }>
                              {user.plan}
                            </Badge>
                          </div>
                          <div>
                            <Badge variant={user.active ? "outline" : "secondary"} className={user.active ? "bg-green-500/10 text-green-500" : ""}>
                              {user.active ? "Activo" : "Suspendido"}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => 
                              logAdminAction('User profile', `Viewed profile of ${user.name}`)
                            }>
                              Ver perfil
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => 
                              logAdminAction('User status', `Changed status of ${user.name} to ${!user.active ? 'active' : 'suspended'}`)
                            }>
                              {user.active ? "Suspender" : "Activar"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Mostrando 5 de 243 usuarios
                    </div>
                    <div className="flex gap-1">
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
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Tickets de soporte</CardTitle>
                    <CardDescription>
                      Gestiona las solicitudes de soporte de los usuarios
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="text-left p-4">Asunto</th>
                          <th className="text-left p-4">Usuario</th>
                          <th className="text-left p-4">Estado</th>
                          <th className="text-left p-4">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { subject: "Problema con inicio de sesión", user: "Juan Pérez", status: "Pendiente", date: "Hoy" },
                          { subject: "Error en la conversión", user: "Marta Sánchez", status: "En proceso", date: "Ayer" },
                          { subject: "No puedo configurar alertas", user: "Carlos Rodríguez", status: "Resuelto", date: "2 días" },
                        ].map((ticket, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-4">
                              <div className="font-medium">{ticket.subject}</div>
                            </td>
                            <td className="p-4 text-sm">{ticket.user}</td>
                            <td className="p-4">
                              <Badge
                                variant={
                                  ticket.status === "Pendiente" ? "destructive" :
                                  ticket.status === "En proceso" ? "default" : "outline"
                                }
                                className={ticket.status === "Resuelto" ? "bg-green-500/10 text-green-500" : ""}
                              >
                                {ticket.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">{ticket.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* FEATURES TAB */}
            <TabsContent value="features" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Activación de Features</h2>
                <Button 
                  onClick={() => logAdminAction('Feature settings', 'Saved global feature settings')}
                >
                  Guardar cambios
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Control de módulos</CardTitle>
                  <CardDescription>
                    Activa o desactiva funcionalidades específicas de la plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Módulos principales</h3>
                      <div className="space-y-2">
                        {[
                          { name: "Dashboard", description: "Panel principal con widgets", enabled: true },
                          { name: "Chatbot AI", description: "Asistente inteligente de criptomonedas", enabled: true },
                          { name: "Crypto Analyzer", description: "Herramientas de análisis de mercado", enabled: true },
                          { name: "NFT Explorer", description: "Exploración y análisis de NFTs", enabled: true },
                          { name: "Portfolio Manager", description: "Gestión de portafolio de inversiones", enabled: true },
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-3 bg-card border rounded-lg">
                            <div className="space-y-0.5">
                              <div className="font-medium">{feature.name}</div>
                              <div className="text-sm text-muted-foreground">{feature.description}</div>
                            </div>
                            <Switch defaultChecked={feature.enabled} onCheckedChange={(checked) => 
                              logAdminAction('Feature toggle', `Changed ${feature.name} status to ${checked ? 'enabled' : 'disabled'}`)
                            } />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Funciones avanzadas</h3>
                      <div className="space-y-2">
                        {[
                          { name: "Price Predictions", description: "Predicciones basadas en IA", enabled: true },
                          { name: "Social Sentiment Analysis", description: "Análisis de sentimiento de Twitter", enabled: true },
                          { name: "Portfolio Simulator", description: "Simulador de estrategias", enabled: true },
                          { name: "Tax Calculator", description: "Cálculo de impuestos de criptomonedas", enabled: false },
                          { name: "AR Visualization", description: "Visualización en realidad aumentada", enabled: false },
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-3 bg-card border rounded-lg">
                            <div className="space-y-0.5">
                              <div className="font-medium">{feature.name}</div>
                              <div className="text-sm text-muted-foreground">{feature.description}</div>
                            </div>
                            <Switch defaultChecked={feature.enabled} onCheckedChange={(checked) => 
                              logAdminAction('Feature toggle', `Changed ${feature.name} status to ${checked ? 'enabled' : 'disabled'}`)
                            } />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Integraciones</h3>
                      <div className="space-y-2">
                        {[
                          { name: "Vertex AI Integration", description: "Integración con Google IA", enabled: true },
                          { name: "CoinAPI Data Feed", description: "Datos en tiempo real", enabled: true },
                          { name: "News API", description: "Noticias de criptomonedas", enabled: true },
                          { name: "Social Media Integration", description: "Compartir en redes sociales", enabled: false },
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-3 bg-card border rounded-lg">
                            <div className="space-y-0.5">
                              <div className="font-medium">{feature.name}</div>
                              <div className="text-sm text-muted-foreground">{feature.description}</div>
                            </div>
                            <Switch defaultChecked={feature.enabled} onCheckedChange={(checked) => 
                              logAdminAction('Integration toggle', `Changed ${feature.name} status to ${checked ? 'enabled' : 'disabled'}`)
                            } />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SYSTEM INTEGRITY TAB */}
            <TabsContent value="system" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Integridad del Sistema</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => 
                    logAdminAction('System check', 'Ran system validation check')
                  }>
                    <CheckCircle size={16} className="mr-2" />
                    Verificar sistema
                  </Button>
                  <Button onClick={() => 
                    logAdminAction('System sync', 'Synced chatbot and UI modules')
                  }>
                    <Sliders size={16} className="mr-2" />
                    Sincronizar módulos
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Diagnóstico del sistema</CardTitle>
                    <CardDescription>
                      Verificación del estado de los componentes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {[
                        { name: "Frontend UI", status: "Operativo", color: "green" },
                        { name: "Backend API", status: "Operativo", color: "green" },
                        { name: "Base de datos", status: "Operativo", color: "green" },
                        { name: "Integración de IA", status: "Operativo", color: "green" },
                        { name: "Sistema de autenticación", status: "Operativo", color: "green" },
                        { name: "API de terceros", status: "Advertencia", color: "amber" },
                      ].map((component, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm">{component.name}</span>
                          <Badge variant="outline" className={`bg-${component.color}-500/10 text-${component.color}-500`}>
                            {component.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4">
                      <Button variant="outline" className="w-full" onClick={() => 
                        logAdminAction('System report', 'Generated system health report')
                      }>
                        <FileText size={16} className="mr-2" />
                        Generar informe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Estado del chatbot</CardTitle>
                    <CardDescription>
                      Diagnóstico y rendimiento del asistente IA
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Estado</span>
                          <Badge variant="outline" className="bg-green-500/10 text-green-500">Activo</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Tiempo de respuesta</span>
                          <span className="font-medium">1.2s</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Precisión</span>
                          <span className="font-medium">98.5%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Conversaciones hoy</span>
                          <span className="font-medium">342</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Última actualización</span>
                          <span className="text-sm text-muted-foreground">Hace 2 horas</span>
                        </div>
                      </div>
                      
                      <div className="rounded-md border p-3">
                        <h4 className="text-sm font-medium mb-2">Modelo IA en uso</h4>
                        <div className="flex justify-between items-center text-sm">
                          <span>Google Vertex AI</span>
                          <Badge variant="outline">v2.1</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button variant="outline" className="w-full" onClick={() => 
                        logAdminAction('Chatbot action', 'Refreshed chatbot training data')
                      }>
                        Actualizar datos de entrenamiento
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Alertas del sistema</CardTitle>
                    <CardDescription>
                      Eventos que requieren atención
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { 
                          title: "API de noticias con respuesta lenta", 
                          description: "El tiempo de respuesta ha aumentado a >2s", 
                          time: "Hace 30 min", 
                          severity: "medium" 
                        },
                        { 
                          title: "Actualización de sistema pendiente", 
                          description: "Nueva versión disponible v1.5.3", 
                          time: "Hace 2 horas", 
                          severity: "low" 
                        },
                        { 
                          title: "Límite de consultas CoinAPI", 
                          description: "Alcanzado el 85% del límite diario", 
                          time: "Hace 1 hora", 
                          severity: "high" 
                        },
                      ].map((alert, i) => (
                        <div 
                          key={i} 
                          className={`p-3 rounded-md border-l-4 ${
                            alert.severity === 'high' ? 'border-l-red-500 bg-red-500/5' : 
                            alert.severity === 'medium' ? 'border-l-amber-500 bg-amber-500/5' : 
                            'border-l-blue-500 bg-blue-500/5'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                            <Badge variant="outline" className={
                              alert.severity === 'high' ? 'bg-red-500/10 text-red-500' : 
                              alert.severity === 'medium' ? 'bg-amber-500/10 text-amber-500' : 
                              'bg-blue-500/10 text-blue-500'
                            }>
                              {alert.severity === 'high' ? 'Alta' : 
                               alert.severity === 'medium' ? 'Media' : 'Baja'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{alert.description}</p>
                          <div className="text-xs text-muted-foreground">{alert.time}</div>
                        </div>
                      ))}
                      
                      <Button variant="outline" className="w-full" onClick={() => 
                        logAdminAction('Alert action', 'Viewed all system alerts')
                      }>
                        Ver todas las alertas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Registro de actividades del sistema</CardTitle>
                  <CardDescription>
                    Historial de actividades y actualizaciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { 
                        action: "Actualización de sistema", 
                        details: "Sistema actualizado a v1.5.2", 
                        time: "10:30 AM, hoy", 
                        user: "Sistema" 
                      },
                      { 
                        action: "Sincronización de chatbot", 
                        details: "Datos de entrenamiento actualizados", 
                        time: "9:45 AM, hoy", 
                        user: "admin" 
                      },
                      { 
                        action: "Alerta resuelta", 
                        details: "Problema de conexión con API resuelto", 
                        time: "Ayer, 4:20 PM", 
                        user: "admin" 
                      },
                      { 
                        action: "Feature activado", 
                        details: "Social Sentiment Analysis activado", 
                        time: "Ayer, 2:15 PM", 
                        user: "admin" 
                      },
                      { 
                        action: "Mantenimiento programado", 
                        details: "Programada actualización para 15/04/2025", 
                        time: "Ayer, 10:30 AM", 
                        user: "admin" 
                      },
                    ].map((log, i) => (
                      <div key={i} className="flex justify-between border-b pb-3 last:border-0 last:pb-0">
                        <div className="space-y-1">
                          <div className="font-medium">{log.action}</div>
                          <div className="text-sm text-muted-foreground">{log.details}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">{log.time}</div>
                          <div className="text-xs text-muted-foreground">Por: {log.user}</div>
                        </div>
                      </div>
                    ))}
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

export default AdminDashboard;