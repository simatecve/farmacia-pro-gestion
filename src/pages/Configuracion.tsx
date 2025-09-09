import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyForm } from "@/components/settings/CompanyForm";
import { TaxSettings } from "@/components/settings/TaxSettings";
import { DeviceSettings } from "@/components/settings/DeviceSettings";
import { PrintSettings } from "@/components/settings/PrintSettings";
import { UserManagement } from "@/components/users/UserManagement";
import { WebhookSettings } from "@/components/webhooks/WebhookSettings";
import { Settings, Building2, Receipt, Printer, Cpu, Users, Webhook } from "lucide-react";

export default function Configuracion() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
          <p className="text-muted-foreground">
            Configura los datos de tu empresa, usuarios, dispositivos y más
          </p>
        </div>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Empresa</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Usuarios</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            <span className="hidden sm:inline">Webhooks</span>
          </TabsTrigger>
          <TabsTrigger value="taxes" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Impuestos</span>
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            <span className="hidden sm:inline">Dispositivos</span>
          </TabsTrigger>
          <TabsTrigger value="printing" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Impresión</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <CompanyForm />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhookSettings />
        </TabsContent>

        <TabsContent value="taxes">
          <TaxSettings />
        </TabsContent>

        <TabsContent value="devices">
          <DeviceSettings />
        </TabsContent>

        <TabsContent value="printing">
          <PrintSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}