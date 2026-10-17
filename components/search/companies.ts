// Sample companies for the search page (fake data, except the demo café).
const WEB = [null, "elektro-wagner.de", null, "holzbau-maier.de", null, null, "krueger-bau.de", "neumann-elektrotechnik.de", null, null, "fliesen-schaefer.de", "metallbau-zimmermann.de", "schmitt-haustechnik.de", null, null, "zimmerei-braun.de", "solar-lange.de", null, null];

export const COMPANIES = [
  ["Café Le Vent", "Coffee bar", "Berlin", "—", "Café"],
  ["Elektro Wagner", "GmbH", "Köln", "HRB 48213", "Electrician"],
  ["Sanitär Becker & Söhne", "GmbH & Co. KG", "Düsseldorf", "HRA 22917", "Plumbing"],
  ["Holzbau Schreiner Maier", "e.K.", "Augsburg", "HRA 18402", "Carpentry"],
  ["Dachdeckerei Hoffmann", "GmbH", "Bielefeld", "HRB 40156", "Roofing"],
  ["Malerbetrieb Schulz", "GbR", "Leipzig", "—", "Painting"],
  ["Bauunternehmen Krüger", "GmbH", "Hannover", "HRB 61734", "Construction"],
  ["Elektrotechnik Neumann", "UG", "Dresden", "HRB 39811", "Electrician"],
  ["Heizung & Sanitär Fischer", "GmbH", "Stuttgart", "HRB 75230", "Heating"],
  ["Tischlerei Weber", "e.K.", "Münster", "HRA 9184", "Carpentry"],
  ["Fliesen Schäfer", "GmbH", "Mainz", "HRB 51209", "Tiling"],
  ["Metallbau Zimmermann", "GmbH & Co. KG", "Nürnberg", "HRA 16733", "Metalwork"],
  ["Elektro Schmitt Haustechnik", "GmbH", "Frankfurt am Main", "HRB 112408", "Electrician"],
  ["Gartenbau Richter", "GbR", "Bremen", "—", "Landscaping"],
  ["Klempnerei Wolf", "e.K.", "Kassel", "HRA 7719", "Plumbing"],
  ["Zimmerei Braun", "GmbH", "Freiburg", "HRB 70442", "Carpentry"],
  ["Solartechnik Lange", "GmbH", "Hamburg", "HRB 158320", "Solar"],
  ["Bäckerei Hartmann", "OHG", "München", "HRA 98412", "Bakery"],
  ["Schlosserei Werner", "e.K.", "Essen", "HRA 13028", "Locksmith"],
].map(([name, form, city, reg, trade], i) => ({ name, form, city, reg, trade, website: WEB[i] }));

export function initials(name: string): string {
  return name.split(/\s+/).filter((w) => /^[A-ZÄÖÜ]/.test(w)).slice(0, 2).map((w) => w[0]).join("");
}
