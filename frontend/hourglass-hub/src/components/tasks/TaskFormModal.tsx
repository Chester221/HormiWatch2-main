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

// Hooks
import { useCreateTask, useUpdateTask, type Task } from "@/hooks/useTasks";
import { useServices } from "@/hooks/useServices";
import { useTechnicians } from "@/hooks/useTeamMembers";

const taskSchema = z.object({
    description: z.string().optional(),
    project_id: z.string().min(1, "Selecciona un proyecto"), // Pasado como prop si estamos en el modal de proyecto
    technician_id: z.string().min(1, "Selecciona un técnico"),
    service_id: z.string().min(1, "Selecciona un servicio"),
    start_time: z.string().min(1, "Fecha de inicio requerida"),
    end_time: z.string().optional(),
    status: z.enum(['In Progress', 'Completed', 'Pending', 'On Hold', 'Cancelled']),
    priority: z.enum(['High', 'Medium', 'Low']),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task?: Task | null;
    projectId: string; // Contexto del proyecto actual
}

export function TaskFormModal({ open, onOpenChange, task, projectId }: TaskFormModalProps) {
    const isEditing = !!task;
    const createTask = useCreateTask();
    const updateTask = useUpdateTask();
    const isSubmitting = createTask.isPending || updateTask.isPending;

    // Data sources
    const { data: services = [] } = useServices();
    const { data: technicians = [] } = useTechnicians();

    const form = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            description: "",
            project_id: projectId,
            technician_id: "",
            service_id: "",
            start_time: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
            status: "Pending",
            priority: "Medium",
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                description: task?.description || "",
                project_id: projectId, // Siempre forzamos el proyecto actual
                technician_id: task?.technician_id || "",
                service_id: task?.service_id || "",
                start_time: task?.start_time ? new Date(task.start_time).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                end_time: task?.end_time ? new Date(task.end_time).toISOString().slice(0, 16) : undefined,
                status: (task?.status as any) || "Pending",
                priority: (task?.priority as any) || "Medium",
            });
        }
    }, [open, task, projectId, form]);

    const handleSubmit = async (data: TaskFormData) => {
        try {
            // Encontrar tarifa del servicio seleccionado
            const selectedService = services.find(s => s.id === data.service_id);
            const hourlyRate = selectedService?.default_hourly_rate || 0;

            const payload = {
                ...data,
                applied_hourly_rate: hourlyRate,
                start_time: new Date(data.start_time).toISOString(),
                end_time: data.end_time ? new Date(data.end_time).toISOString() : null,
            };

            if (isEditing && task) {
                await updateTask.mutateAsync({ id: task.id, data: payload as any });
                toast.success("Tarea actualizada");
            } else {
                await createTask.mutateAsync(payload as any);
                toast.success("Tarea creada");
            }
            onOpenChange(false);
        } catch (error: any) {
            toast.error(`Error: ${error.message}`);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-card border-border">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Tarea" : "Nueva Tarea"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="service_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Servicio</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar servicio" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {services.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>
                                                        {s.name} (${s.default_hourly_rate}/h)
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
                                name="technician_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Técnico</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Asignar técnico" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {technicians.map((t) => (
                                                    <SelectItem key={t.id} value={t.id}>
                                                        {t.full_name || t.email}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="start_time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Inicio</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="end_time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fin (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Pending">Pendiente</SelectItem>
                                                <SelectItem value="In Progress">En Progreso</SelectItem>
                                                <SelectItem value="Completed">Completada</SelectItem>
                                                <SelectItem value="On Hold">En Espera</SelectItem>
                                                <SelectItem value="Cancelled">Cancelada</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prioridad</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Prioridad" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Low">Baja</SelectItem>
                                                <SelectItem value="Medium">Media</SelectItem>
                                                <SelectItem value="High">Alta</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                            placeholder="Detalles del trabajo realizado..."
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
                                {isEditing ? "Guardar Cambios" : "Crear Tarea"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
