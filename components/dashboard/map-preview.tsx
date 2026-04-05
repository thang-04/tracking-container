"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Truck, Package, ArrowRight } from "lucide-react"
import Link from "next/link"

const locations = [
  { id: 1, name: "Cảng Hải Phòng", type: "port", containers: 45, x: 75, y: 25 },
  { id: 2, name: "Cảng cạn Hà Nội", type: "dryport", containers: 28, x: 60, y: 20 },
  { id: 3, name: "Cảng Đà Nẵng", type: "port", containers: 32, x: 70, y: 55 },
  { id: 4, name: "Cảng cạn TP.HCM", type: "dryport", containers: 52, x: 65, y: 85 },
]

const trucks = [
  { id: 1, x: 68, y: 35 },
  { id: 2, x: 72, y: 70 },
  { id: 3, x: 62, y: 50 },
]

export function MapPreview() {
  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Theo dõi trực tiếp</CardTitle>
        <Link href="/map">
          <Button variant="ghost" size="sm" className="gap-1">
            Xem bản đồ <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="relative h-[300px] rounded-lg bg-secondary/50 overflow-hidden">
          {/* Vietnam Map Simplified Shape */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full"
            style={{ opacity: 0.3 }}
          >
            <path
              d="M60,5 L75,10 L80,25 L75,35 L70,45 L72,55 L68,65 L70,75 L65,90 L55,95 L58,80 L60,70 L55,60 L58,50 L55,40 L60,30 L55,20 L60,5"
              fill="hsl(var(--primary))"
              stroke="hsl(var(--primary))"
              strokeWidth="0.5"
            />
          </svg>

          {/* Location Markers */}
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="absolute flex flex-col items-center"
              style={{ left: `${loc.x}%`, top: `${loc.y}%`, transform: "translate(-50%, -50%)" }}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  loc.type === "port"
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground"
                }`}
              >
                {loc.type === "port" ? (
                  <Package className="h-4 w-4" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
              </div>
              <span className="mt-1 text-[10px] font-medium text-foreground whitespace-nowrap bg-background/80 px-1 rounded">
                {loc.name}
              </span>
            </div>
          ))}

          {/* Truck Markers */}
          {trucks.map((truck) => (
            <div
              key={truck.id}
              className="absolute animate-pulse"
              style={{ left: `${truck.x}%`, top: `${truck.y}%`, transform: "translate(-50%, -50%)" }}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warning text-warning-foreground">
                <Truck className="h-3 w-3" />
              </div>
            </div>
          ))}

          {/* Route Lines */}
          <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: "none" }}>
            <line
              x1="75%"
              y1="25%"
              x2="60%"
              y2="20%"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray="4"
              opacity="0.5"
            />
            <line
              x1="70%"
              y1="55%"
              x2="65%"
              y2="85%"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray="4"
              opacity="0.5"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Cảng biển</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-accent" />
            <span className="text-muted-foreground">Cảng cạn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-warning" />
            <span className="text-muted-foreground">Xe tải</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
