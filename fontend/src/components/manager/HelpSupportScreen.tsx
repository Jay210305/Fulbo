import { ArrowLeft, HelpCircle, Book, MessageCircle, Mail, Phone, ExternalLink, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

interface HelpSupportScreenProps {
  onBack: () => void;
}

export function HelpSupportScreen({ onBack }: HelpSupportScreenProps) {
  const faqItems = [
    {
      question: "¿Cómo agrego una nueva cancha?",
      answer: "Ve a la pestaña 'Canchas' y toca el botón '+' en la esquina superior derecha."
    },
    {
      question: "¿Cómo configuro los horarios de mi cancha?",
      answer: "En la pestaña 'Horarios', selecciona la cancha y define los bloques horarios disponibles."
    },
    {
      question: "¿Cómo creo una promoción?",
      answer: "En 'Publicidad', toca el botón '+' para crear una nueva promoción con descuentos personalizados."
    },
    {
      question: "¿Cómo cobro a mis clientes?",
      answer: "Configura tus métodos de pago en 'Perfil > Métodos de Pago' para recibir transferencias o tarjetas."
    },
    {
      question: "¿Cómo cancelo una reserva?",
      answer: "En 'Dashboard', encuentra la reserva y selecciona la opción de cancelar con motivo."
    }
  ];

  const tutorials = [
    {
      title: "Primeros Pasos con Fulbo Manager",
      duration: "5 min",
      description: "Aprende a configurar tu cuenta y agregar tu primera cancha"
    },
    {
      title: "Gestión de Horarios y Disponibilidad",
      duration: "8 min",
      description: "Domina la configuración de bloques horarios y precios"
    },
    {
      title: "Maximiza tus Reservas con Promociones",
      duration: "6 min",
      description: "Crea ofertas atractivas para llenar tus canchas"
    },
    {
      title: "Administra tu Equipo de Staff",
      duration: "7 min",
      description: "Agrega empleados y asigna permisos de manera segura"
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h2>Ayuda y Soporte</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Contacto Directo */}
        <div>
          <h3 className="mb-3">Contacto Directo</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-4 border border-border rounded-xl hover:bg-secondary transition-colors">
              <div className="w-10 h-10 bg-[#047857] rounded-lg flex items-center justify-center">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <p>Chat en Vivo</p>
                <p className="text-sm text-muted-foreground">Lun-Vie 9am-6pm</p>
              </div>
              <ChevronRight size={20} className="text-muted-foreground" />
            </button>

            <button className="w-full flex items-center gap-3 p-4 border border-border rounded-xl hover:bg-secondary transition-colors">
              <div className="w-10 h-10 bg-[#047857] rounded-lg flex items-center justify-center">
                <Mail size={20} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <p>Correo Electrónico</p>
                <p className="text-sm text-muted-foreground">soporte@fulbo.com</p>
              </div>
              <ExternalLink size={16} className="text-muted-foreground" />
            </button>

            <button className="w-full flex items-center gap-3 p-4 border border-border rounded-xl hover:bg-secondary transition-colors">
              <div className="w-10 h-10 bg-[#047857] rounded-lg flex items-center justify-center">
                <Phone size={20} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <p>Teléfono</p>
                <p className="text-sm text-muted-foreground">+51 1 234 5678</p>
              </div>
              <ExternalLink size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Tutoriales */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Book size={20} className="text-[#047857]" />
            <h3>Tutoriales para Managers</h3>
          </div>
          <div className="space-y-2">
            {tutorials.map((tutorial, index) => (
              <button
                key={index}
                className="w-full flex items-start gap-3 p-4 border border-border rounded-xl hover:bg-secondary transition-colors"
              >
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Book size={20} className="text-[#047857]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="mb-1">{tutorial.title}</p>
                  <p className="text-sm text-muted-foreground mb-1">{tutorial.description}</p>
                  <span className="text-xs text-[#047857]">{tutorial.duration} de lectura</span>
                </div>
                <ChevronRight size={20} className="text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Preguntas Frecuentes */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle size={20} className="text-[#047857]" />
            <h3>Preguntas Frecuentes</h3>
          </div>
          <div className="space-y-3">
            {faqItems.map((faq, index) => (
              <div
                key={index}
                className="border border-border rounded-xl p-4"
              >
                <p className="mb-2">{faq.question}</p>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ver más FAQs */}
        <Button
          variant="outline"
          className="w-full"
        >
          Ver Todas las Preguntas Frecuentes
        </Button>

        {/* Info adicional */}
        <div className="bg-secondary rounded-xl p-4">
          <h3 className="mb-2">¿Necesitas más ayuda?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Nuestro equipo de soporte está disponible para ayudarte con cualquier consulta o problema que tengas.
          </p>
          <Button className="w-full bg-[#047857] hover:bg-[#047857]/90">
            <MessageCircle size={18} className="mr-2" />
            Iniciar Chat
          </Button>
        </div>
      </div>
    </div>
  );
}
