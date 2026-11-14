import { useState, type FormEvent } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ESPECIES = [
  { value: "orellana-blanca", label: "Orellana blanca" },
  { value: "orellana-rosa", label: "Orellana rosa" },
  { value: "shiitake", label: "Shiitake" },
  { value: "lions-mane", label: "Melena de león" },
  { value: "reishi", label: "Reishi" },
  { value: "nameko", label: "Nameko" },
  { value: "cardo", label: "Cardo" },
  { value: "enoki", label: "Enoki" },
  { value: "grey-mushroom", label: "Gris" },
]

const TIPOS_SUSTRATO = [
  { value: "paja", label: "Paja" },
  { value: "aserrin", label: "Aserrín" },
  { value: "cascarilla-cafe", label: "Cascarilla de café" },
  { value: "mixto", label: "Mixto" },
]

type LoteFormValues = {
  loteId: string
  especie: string
  fechaInoculacion: string
  cantidadUnidades: string
  tipoSustrato: string
  receta: string
  proveedorSpawn: string
  porcentajeInoculacion: string
  temperatura: string
  humedad: string
  ubicacion: string
  notas: string
}

const initialValues: LoteFormValues = {
  loteId: "",
  especie: "",
  fechaInoculacion: "",
  cantidadUnidades: "",
  tipoSustrato: "",
  receta: "",
  proveedorSpawn: "",
  porcentajeInoculacion: "",
  temperatura: "",
  humedad: "",
  ubicacion: "",
  notas: "",
}

export function LoteForm() {
  const [values, setValues] = useState<LoteFormValues>(initialValues)
  const [submitted, setSubmitted] = useState<LoteFormValues | null>(null)

  const update = <K extends keyof LoteFormValues>(key: K, value: LoteFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(values)
  }

  const handleReset = () => {
    setValues(initialValues)
    setSubmitted(null)
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-medium text-foreground">Registro de lote</h1>
        <p className="text-sm text-muted-foreground">
          Captura los datos de un nuevo lote de producción de setas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos básicos</CardTitle>
            <CardDescription>Identificación y tamaño del lote.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="loteId">ID de lote</Label>
              <Input
                id="loteId"
                placeholder="LOTE-0001"
                required
                value={values.loteId}
                onChange={(e) => update("loteId", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="especie">Especie / variedad</Label>
              <Select
                value={values.especie}
                onValueChange={(value) => update("especie", value)}
              >
                <SelectTrigger id="especie" className="w-full">
                  <SelectValue placeholder="Selecciona una especie" />
                </SelectTrigger>
                <SelectContent>
                  {ESPECIES.map((especie) => (
                    <SelectItem key={especie.value} value={especie.value}>
                      {especie.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="fechaInoculacion">Fecha de inoculación</Label>
              <Input
                id="fechaInoculacion"
                type="date"
                required
                value={values.fechaInoculacion}
                onChange={(e) => update("fechaInoculacion", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="cantidadUnidades">Cantidad de bolsas / unidades</Label>
              <Input
                id="cantidadUnidades"
                type="number"
                min="1"
                inputMode="numeric"
                placeholder="24"
                required
                value={values.cantidadUnidades}
                onChange={(e) => update("cantidadUnidades", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sustrato y receta</CardTitle>
            <CardDescription>Composición y origen del inóculo.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tipoSustrato">Tipo de sustrato</Label>
              <Select
                value={values.tipoSustrato}
                onValueChange={(value) => update("tipoSustrato", value)}
              >
                <SelectTrigger id="tipoSustrato" className="w-full">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_SUSTRATO.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="proveedorSpawn">Proveedor de spawn</Label>
              <Input
                id="proveedorSpawn"
                placeholder="Nombre del proveedor"
                value={values.proveedorSpawn}
                onChange={(e) => update("proveedorSpawn", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="porcentajeInoculacion">% de inoculación</Label>
              <Input
                id="porcentajeInoculacion"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="5"
                value={values.porcentajeInoculacion}
                onChange={(e) => update("porcentajeInoculacion", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="receta">Receta utilizada</Label>
              <Textarea
                id="receta"
                placeholder="Describe la receta o referencia el nombre de la receta usada"
                value={values.receta}
                onChange={(e) => update("receta", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Condiciones ambientales</CardTitle>
            <CardDescription>Parámetros objetivo y ubicación del lote.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="temperatura">Temperatura objetivo (°C)</Label>
              <Input
                id="temperatura"
                type="number"
                step="0.1"
                placeholder="24"
                value={values.temperatura}
                onChange={(e) => update("temperatura", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="humedad">Humedad objetivo (%)</Label>
              <Input
                id="humedad"
                type="number"
                min="0"
                max="100"
                placeholder="85"
                value={values.humedad}
                onChange={(e) => update("humedad", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="ubicacion">Ubicación / incubadora asignada</Label>
              <Input
                id="ubicacion"
                placeholder="Incubadora 1 - Estante A"
                value={values.ubicacion}
                onChange={(e) => update("ubicacion", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                placeholder="Observaciones adicionales"
                value={values.notas}
                onChange={(e) => update("notas", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleReset}>
            Limpiar
          </Button>
          <Button type="submit">Registrar lote</Button>
        </div>
      </form>

      {submitted ? (
        <Card>
          <CardHeader>
            <CardTitle>Lote registrado</CardTitle>
            <CardDescription>Vista previa de los datos enviados.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-none border border-border bg-muted p-4 font-mono text-xs text-muted-foreground">
              {JSON.stringify(submitted, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
