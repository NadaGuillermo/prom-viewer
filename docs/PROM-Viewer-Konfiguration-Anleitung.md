# Anleitung: Erstellung der PROM-Viewer-Konfigurationsdatei

## 1. Zweck dieser Konfigurationsdatei

Die Konfigurationsdatei (`proms.json`) steuert, **wie Patient-reported Outcome Measures (PROMs)** im PROM-Viewer angezeigt werden. Sie legt fest:

- welche **Fragebögen (Questionnaires)** eingebunden werden,
- wie deren **Items (Fragen/Scores)** zu **Domänen** (z. B. „Physical Health", „Mental Health") gruppiert werden,
- welche Items **Scores** sind und wie diese **interpretiert** werden (Wertebereich, Referenzwerte, Richtung der Gesundheitskorrelation),
- welche Scores als **globale Gesundheitswerte** gelten.

Die Datei richtet sich an **IT-Personal**, das die Anwendung konfiguriert und nicht an medizinisches Fachpersonal. Sie muss `proms.json` heißen und dem JSON-Schema `proms.schema.json` entsprechen, gegen das sie validiert wird.

> **Hinweis:** Die eigentlichen Fragebogen-Inhalte (Fragetexte, Antwortoptionen) stammen aus FHIR-`Questionnaire`-Ressourcen. Die Konfigurationsdatei verweist nur per URI darauf und ergänzt Anzeige- und Auswertungsinformationen.

---

## 2. Grundstruktur der Datei

Jede Konfigurationsdatei besteht aus zwei Hauptbereichen auf oberster Ebene:

```json
{
  "scoreDefinitions": [ ... ],
  "questionnaires": [ ... ]
}
```

| Feld | Pflichtfeld | Beschreibung |
| --- | --- | --- |
| `scoreDefinitions` | ja | Zentrale Liste aller Score-Definitionen (Wertebereiche, Referenzwerte, Interpretationsrichtung) |
| `questionnaires` | ja | Liste der eingebundenen Fragebögen mit Domänenzuordnung |

Beide Bereiche müssen mindestens ein Element enthalten.

---

## 3. Der Bereich `scoreDefinitions`

Hier werden **Scores** (meist berechnete Werte wie der *EQ-Index* des EQ-5D-5L) beschrieben. Eine Score-Definition wird über eine eindeutige `id` später in `questions` referenziert (`scoreDefinitionId`).

### Felder je Score-Definition

| Feld | Pflicht | Typ | Beschreibung |
| --- | --- | --- | --- |
| `id` | ja | string | Eindeutiger Bezeichner, wird als `scoreDefinitionId` in `questions` referenziert |
| `range` | nein | [number, number] | Minimal- und Maximalwert des Scores, z. B. `[0, 100]` |
| `scoreHealthCorrelation` | nein | `"increase"` \| `"decrease"` | Gibt an, ob ein **höherer** Wert einen **besseren** (`increase`) oder **schlechteren** (`decrease`) Gesundheitszustand bedeutet |
| `referenceRange` | nein | Array von Objekten | Ein oder mehrere Referenzwerte/-bereiche zur Einordnung (z. B. Bevölkerungsdurchschnitt) |

### Aufbau eines `referenceRange`-Eintrags

| Feld | Pflicht | Beschreibung |
| --- | --- | --- |
| `range` | ja | Array der Länge 1 (Einzelwert, z. B. Mittelwert) oder Länge 2 (Bereich, z. B. Interquartilsabstand) |
| `name` | ja | Kurzer Name, z. B. „Population Mean" |
| `description` | nein | Erläuternder Kontext, z. B. Quelle oder Patientengruppe |

### Beispiel

```json
{
  "id": "eortc-global-health",
  "range": [0, 100],
  "scoreHealthCorrelation": "increase",
  "referenceRange": [
    {
      "range": [41.7, 75],
      "name": "Interquartile Range",
      "description": "Ovarian Cancer stage III-IV, EORTC Reference Manual"
    },
    {
      "range": [56.3],
      "name": "Mean",
      "description": "Ovarian Cancer stage III-IV, EORTC Reference Manual"
    }
  ]
}
```

**Wichtig:** `range` und `scoreHealthCorrelation` sind formal optional, sollten aber **immer angegeben werden**, wenn zum entsprechenden Score keine FHIR-`ObservationDefinition` mit `qualifiedInterval.range` existiert. Sind beide Quellen vorhanden, hat die Angabe in der Konfigurationsdatei **Vorrang** vor der `ObservationDefinition`.

---

## 4. Der Bereich `questionnaires`

Jeder Eintrag beschreibt einen Fragebogen und dessen Anzeigestruktur.

| Feld | Pflicht | Beschreibung |
| --- | --- | --- |
| `questionnaire` | ja | Kanonische URI der FHIR-`Questionnaire`-Ressource |
| `domainItemMapping` | ja | Gruppierung der Items in Domänen (siehe unten) |
| `globalScores` | nein | Liste von `itemId`s, die als globale/übergreifende Gesundheitswerte gelten; oft der zusammenfassende (Summen-) Score eines Fragebogens |

### 4.1 `domainItemMapping`

Eine Liste von Domänen-Objekten:

| Feld | Pflicht | Beschreibung |
| --- | --- | --- |
| `domain` | ja | Name der Domäne, unter der die Fragen im Viewer gruppiert werden, z. B. „Physical Health" |
| `questions` | ja | Liste der Items dieser Domäne |

### 4.2 Items in `questions`

| Feld | Pflicht | Beschreibung |
| --- | --- | --- |
| `itemId` | ja | Muss der `linkId` des entsprechenden Items in der referenzierten FHIR-`Questionnaire`-Ressource entsprechen |
| `shortName` | nein | Kurzer, im Chart anzuzeigender Name (max. 25 Zeichen). Sinnvoll bei fehlendem `item.text` oder langen `linkId`s |
| `observationDefinition` | nein | Kanonische URI einer FHIR-`ObservationDefinition`, aus der z. B. Referenzbereiche übernommen werden können |
| `scoreDefinitionId` | nein | Muss einer `id` aus `scoreDefinitions` entsprechen; ordnet dem Item eine Interpretationslogik zu |
| `isDimensionScore` | nein | `true`, wenn das Item als Score für eine Gesundheitsdimension gilt (auch einzelne, unberechnete Items können das sein) |
| `dimension` | nein/bedingt | Gesundheitsdimension, die gemessen wird. **Pflicht, wenn `isDimensionScore: true` gesetzt ist** |

**Zwei Arten von Einträgen kommen in der Praxis vor:**

1. **Reine Rohitems** (keine eigene Auswertung), z. B. einzelne Fragebogenitems, die nur zur Vollständigkeit/Referenz gelistet sind:

   ```json
   { "itemId": "qlq-c30-q01" }
   ```

2. **Score-Items**, die einen berechneten oder eigenständig interpretierbaren Wert darstellen:

   ```json
   {
     "itemId": "score-pf",
     "shortName": "Physical Function",
     "observationDefinition": "https://example.com/fhir/ObservationDefinition/eortc-pf",
     "scoreDefinitionId": "eortc-functional",
     "isDimensionScore": true
   }
   ```

### 4.3 `globalScores`

Eine einfache Liste von `itemId`-Werten (müssen bereits in `domainItemMapping` vorkommen), die als **globaler Gesamt-Gesundheitswert** des Fragebogens hervorgehoben werden, z. B.:

```json
"globalScores": ["score-ql"]
```

---

## 5. Schritt-für-Schritt-Anleitung

1. **Fragebogen identifizieren**: Kanonische URI der FHIR-`Questionnaire`-Ressource beschaffen (z. B. aus dem FHIR-Server/Terminologieserver Ihrer Organisation).
2. **Scores auflisten**: Alle im Fragebogen enthaltenen Scores (Summenscores, Subskalen, VAS etc.) identifizieren und für jeden eine Score-Definition in `scoreDefinitions` anlegen:
   - eindeutige `id` vergeben,
   - `range` und `scoreHealthCorrelation` festlegen,
   - optional Referenzwerte (`referenceRange`) aus Literatur/Manual ergänzen.
3. **Domänen festlegen**: Fachlich sinnvolle Gruppierung überlegen (z. B. „Physical Health", „Mental Health", „Symptoms") – orientiert an klinischer Relevanz, nicht zwingend an der Struktur des Fragebogens.
4. **Items den Domänen zuordnen**: Für jede Domäne die zugehörigen `itemId`s (= `linkId`s aus der Questionnaire-Ressource) unter `questions` eintragen.
   - Rohitems ohne eigene Auswertung: nur `itemId` angeben.
   - Score-Items: zusätzlich `shortName`, `scoreDefinitionId`, `isDimensionScore: true` und ggf. `observationDefinition` angeben.
   - Bei `isDimensionScore: true` **immer** `dimension` mit angeben (sofern nicht bereits über `domain` implizit klar – im Zweifel explizit setzen).
5. **Globale Scores markieren**: Die `itemId`(s), die den Gesamtzustand des Fragebogens am besten repräsentieren, in `globalScores` eintragen.
6. **Gegen das Schema validieren**: Datei mit einem JSON-Schema-Validator gegen `proms.schema.json` prüfen (Draft 2020-12).
7. **Fachliche Prüfung**: Insbesondere `scoreHealthCorrelation` und `range` sollten stichprobenartig von medizinischem Fachpersonal gegengeprüft werden, da eine falsche Richtung (increase/decrease) zu einer fehlerhaften klinischen Interpretation im Viewer führt.

---

## 6. Vollständiges Minimalbeispiel

```json
{
  "scoreDefinitions": [
    {
      "id": "beispiel-score",
      "range": [0, 100],
      "scoreHealthCorrelation": "increase",
      "referenceRange": [
        { "range": [50], "name": "Mittelwert", "description": "Referenzpopulation XY" }
      ]
    }
  ],
  "questionnaires": [
    {
      "questionnaire": "https://example.org/fhir/Questionnaire/beispiel-fragebogen",
      "domainItemMapping": [
        {
          "domain": "Beispiel-Domäne",
          "questions": [
            { "itemId": "frage-01" },
            {
              "itemId": "score-gesamt",
              "shortName": "Gesamtscore",
              "scoreDefinitionId": "beispiel-score",
              "isDimensionScore": true,
              "dimension": "Beispiel-Domäne"
            }
          ]
        }
      ],
      "globalScores": ["score-gesamt"]
    }
  ]
}
```

---

## 7. Häufige Fehlerquellen

| Fehler | Auswirkung | Vermeidung |
| --- | --- | --- |
| `itemId` stimmt nicht mit `linkId` der FHIR-Questionnaire überein | Item wird im Viewer nicht angezeigt oder nicht korrekt zugeordnet | `linkId`s direkt aus der Questionnaire-Ressource kopieren |
| `scoreDefinitionId` verweist auf keine existierende `id` in `scoreDefinitions` | Score kann nicht interpretiert werden | Nach dem Anlegen aller Score-Definitionen alle Referenzen gegenprüfen |
| `isDimensionScore: true` ohne `dimension` | Schema-Validierung schlägt fehl | `dimension` bei jedem Dimension-Score verpflichtend mitangeben |
| `shortName` länger als 25 Zeichen | Schema-Validierung schlägt fehl / Darstellung im Chart bricht um | Kurze, prägnante Bezeichnungen wählen |
| `scoreHealthCorrelation` falsch gesetzt | Score wird im Viewer invertiert dargestellt (z. B. „schlecht" wird als „gut" angezeigt) | Fachlich mit klinischem Personal abstimmen |
| Fehlende `globalScores`, obwohl ein Gesamtscore existiert | Kein übergreifender Gesundheitswert im Viewer sichtbar | Prüfen, ob ein Summenscore als globaler Wert gekennzeichnet werden soll |

---

## 8. Referenz: Feldübersicht (kompakt)

```text
proms.json
├── scoreDefinitions[]
│   ├── id                      (Pflicht)
│   ├── range: [min, max]
│   ├── scoreHealthCorrelation: "increase" | "decrease"
│   └── referenceRange[]
│       ├── range: [wert] | [min, max]  (Pflicht)
│       ├── name                        (Pflicht)
│       └── description
└── questionnaires[]
    ├── questionnaire (URI)     (Pflicht)
    ├── domainItemMapping[]     (Pflicht)
    │   ├── domain              (Pflicht)
    │   └── questions[]
    │       ├── itemId                  (Pflicht)
    │       ├── shortName                (max. 25 Zeichen)
    │       ├── observationDefinition (URI)
    │       ├── scoreDefinitionId        (→ scoreDefinitions.id)
    │       ├── isDimensionScore
    │       └── dimension                (Pflicht, wenn isDimensionScore=true)
    └── globalScores[]                   (→ itemId aus domainItemMapping)
```
