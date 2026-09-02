# Campaign Chronicles — Update Campaign format

`Update Campaign` uses the same compact TXT/DOCX/PDF format as campaign import and performs a non-destructive merge.

## Merge rules

- Existing entries are matched by name/title (sessions use number + title; timeline uses title + date).
- A matching entry is updated.
- A new entry is created.
- Entries already in Campaign Chronicles but absent from the document are never deleted.
- The campaign name in the document must match the campaign being updated. This prevents applying an update to the wrong campaign.
- Maps and uploaded images are not changed by document updates.

## GM Tools sections (V2)

These optional sections are supported when updating a campaign. Lists of linked entities use semicolons (`;`).

```text
NOTAS DEL GM
Título | Contenido

SECRETOS
Título | hidden/revealed | Detalles | Contexto | Personajes;... | NPCs;... | Lugares;... | Facciones;...

PISTAS
Título | undiscovered/discovered | Detalles | Contexto | Personajes;... | NPCs;... | Lugares;... | Facciones;...

HILOS ARGUMENTALES
Título | active/dormant/resolved/abandoned | Detalles | Contexto | Personajes;... | NPCs;... | Lugares;... | Facciones;...

PLANIFICADOR DE SESIÓN
Título | draft/ready/completed | YYYY-MM-DD | Objetivo | Inicio/recap | Escenas | Complicaciones | Notas GM | Detalles | Personajes;... | NPCs;... | Lugares;... | Facciones;... | Secretos;... | Pistas;... | Hilos;...
```

English headings are also accepted: `GM NOTES`, `SECRETS`, `CLUES`, `PLOT THREADS`, `SESSION PLANNER` / `SESSION PLANS`.
