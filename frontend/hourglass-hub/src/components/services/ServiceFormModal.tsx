import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useServiceCategories, useCreateService, useUpdateService, type Service } from "@/hooks/useServices";

// Esquema de validación
const serviceSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  category_id: z.string().min(1, "Por favor selecciona una categoría"),
  description: z.string().optional(),
  default_hourly_rate: z.number().min(0, "La tarifa no puede ser negativa"),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
}

export function ServiceFormModal({
  open,
  onOpenChange,
  service,
}: ServiceFormModalProps) {
  const isEditing = !!service;
  const { data: categories = [], isLoading: loadingCategories } = useServiceCategories();

  const createService = useCreateService();
  const updateService = useUpdateService();
  const isSubmitting = createService.isPending || updateService.isPending;

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      category_id: "",
      description: "",
      default_hourly_rate: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (service) {
        form.reset({
          name: service.name,
          category_id: service.category_id,
          description: service.description || "",
          default_hourly_rate: service.default_hourly_rate,
        });
      } else {
        form.reset({
          name: "",
          category_id: "",
          description: "",
          default_hourly_rate: 0,
        });
      }
    }
  }, [open, service, form]);

  const handleSubmit = async (data: ServiceFormData) => {
    try {
      if (isEditing && service) {
        await updateService.mutateAsync({
          id: service.id,
          data: {
            name: data.name,
            category_id: data.category_id,
            description: data.description || null,
            default_hourly_rate: data.default_hourly_rate,
          }
        });
        toast.success("Servicio actualizado correctamente");
      } else {
        await createService.mutateAsync({
          name: data.name,
          category_id: data.category_id,
          description: data.description || undefined,
          default_hourly_rate: data.default_hourly_rate,
        });
        toast.success("Servicio creado correctamente");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Servicio" : "Nuevo Servicio"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Servicio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Instalación de Servidor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingCategories ? "Cargando..." : "Selecciona categoría"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="default_hourly_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarifa por Hora ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalles sobre el servicio..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2 shadow-glow">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? "Guardar Cambios" : "Crear Servicio"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
