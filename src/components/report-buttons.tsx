"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import {
  getDailySalesReportData,
  getMonthlySalesReportData,
  getFamilySalesReportData,
} from "@/app/actions/reports";
import { toast } from "sonner";
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function ReportButtons() {
  const [loading, setLoading] = useState<string | null>(null);

  async function downloadPdf(
    title: string,
    filename: string,
    headers: string[],
    action: () => Promise<any>
  ) {
    setLoading(filename);
    try {
      const response = await action();
      // Handle both array (monthly/family) and object (daily)
      const data = Array.isArray(response) ? response : response.rows;
      
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text(title, 14, 22);

      autoTable(doc, {
        startY: 30,
        head: [headers],
        body: data,
        theme: "grid",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      // Si hay totales extra (Reporte Diario)
      if (!Array.isArray(response) && response.totalDia !== undefined) {
        const finalY = (doc as any).lastAutoTable.finalY || 30;
        doc.setFontSize(12);
        doc.text(`Resumen de Turnos`, 14, finalY + 10);
        doc.setFontSize(10);
        doc.text(`Total Turno Mañana (TM): ${response.totalTM.toFixed(2)} €`, 14, finalY + 16);
        doc.text(`Total Turno Tarde (TT): ${response.totalTT.toFixed(2)} €`, 14, finalY + 22);
        doc.setFontSize(14);
        doc.text(`Total Día: ${response.totalDia.toFixed(2)} €`, 14, finalY + 30);
      }

      doc.save(filename);
      toast.success(`Reporte ${filename} descargado con éxito`);
    } catch (error) {
      toast.error("Error al generar el reporte");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={!!loading}
        onClick={() =>
          downloadPdf(
            "Reporte de Ventas Diario",
            "ventas_hoy.pdf",
            ["Ticket ID", "Hora", "Artículo", "Cantidad", "Precio Unitario", "Total Línea"],
            getDailySalesReportData
          )
        }
      >
        <FileText className="mr-2 h-4 w-4" />
        {loading === "ventas_hoy.pdf" ? "Generando..." : "Diario PDF"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!!loading}
        onClick={() =>
          downloadPdf(
            "Reporte de Ventas Mensual",
            "ventas_mes.pdf",
            ["Fecha", "Ticket ID", "Total Venta"],
            getMonthlySalesReportData
          )
        }
      >
        <FileText className="mr-2 h-4 w-4" />
        {loading === "ventas_mes.pdf" ? "Generando..." : "Mensual PDF"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!!loading}
        onClick={() =>
          downloadPdf(
            "Reporte de Ventas por Familias (Hoy)",
            "ventas_familias_hoy.pdf",
            ["Familia", "Unidades Vendidas", "Ingresos Totales"],
            () => getFamilySalesReportData("day")
          )
        }
      >
        <FileText className="mr-2 h-4 w-4" />
        {loading === "ventas_familias_hoy.pdf" ? "Generando..." : "Familias Hoy PDF"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!!loading}
        onClick={() =>
          downloadPdf(
            "Reporte de Ventas por Familias (Mensual)",
            "ventas_familias_mes.pdf",
            ["Familia", "Unidades Vendidas", "Ingresos Totales"],
            () => getFamilySalesReportData("month")
          )
        }
      >
        <FileText className="mr-2 h-4 w-4" />
        {loading === "ventas_familias_mes.pdf" ? "Generando..." : "Familias Mes PDF"}
      </Button>
    </div>
  );
}
