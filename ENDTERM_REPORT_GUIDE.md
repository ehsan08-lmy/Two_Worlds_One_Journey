# Endterm report notes — Two Worlds, One Journey

Use these notes when preparing the required DOCX/PDF report. Add your own fresh screenshots from the running site before submitting.

## Project details

**Project:** Two Worlds, One Journey — Field Archive Endterm Edition  
**Student:** Ehsanullah Alimy  
**Type:** Individual project  
**Midterm repository:** https://github.com/ehsan08-lmy/Two_Worlds_One_Journey  
**Deployed website:** https://ehsan08-lmy.github.io/Two_Worlds_One_Journey/

## What is new since the Midterm

The original three-page website has been developed into an interactive front-end experience. The concept is now presented as a personal field archive: an editorial journal that connects places, cultural details and a route between Afghanistan and Kazakhstan.

The new Home page includes a switchable two-world lens. Selecting Afghanistan or Kazakhstan changes the photograph, narrative, coordinates and link to the corresponding atlas filter.

The Places page now contains 13 JavaScript-driven place records. Visitors can search, filter by country, filter by category, sort the results and show only saved places. The page also includes an object-study gallery with a Herat carpet, a traditional Kazakh yurt interior and a Kazakh dombra.

The Journey page includes a route planner with add/remove/reorder controls, locally saved choices, calculated stop count, estimated visit time, straight-line distance and country balance. A live Two Worlds Passport turns saved places into collectible visual stamps and has a print-friendly view. The page also includes an interactive Leaflet map and a seven-field validated form.

## What was improved after the Midterm defense

The Midterm feedback said the visual style could be more creative and memorable, with more topic-related visual and interactive details. This version addresses that feedback through a distinctive field-archive visual identity, country-specific colour language, real named-location photography, cultural object studies, an interactive two-world lens, the map-based route and the route passport. Hover, focus, empty, error, success, saved and print states have their own styling.

## Technologies and implementation

- HTML5 semantic elements across the three pages.
- CSS3 custom design system, Grid, Flexbox, responsive media queries, keyframe animation, transitions and reduced-motion support.
- Bootstrap 5.3.3 for responsive navigation and form components.
- JavaScript modules in the `js/` folder. The 13-item data array is used to generate the atlas cards through DOM manipulation.
- jQuery 3.7.1 for smooth scrolling, accordion slide transitions, lightbox fades and form success feedback.
- Leaflet 1.9.4 and OpenStreetMap for the interactive route map.
- `localStorage` for the selected route and theme preference.

## Individual contribution

This is an individual project. Describe the parts you personally reviewed, customized, tested and can explain during the defense. The website credits OpenAI ChatGPT as a coding/documentation assistant; keep that disclosure in the report as well.

## Screenshots to insert

1. Home page at desktop width showing the cover and Bamiyan/Astana photos.
2. Home page with the Kazakhstan lens selected, showing the changed photo and narrative.
3. Places page showing the full atlas and the country/category filters.
4. Places page showing the Culture category and the three cultural object studies.
5. Journey page showing a route with at least one Afghanistan and one Kazakhstan stop.
6. The Two Worlds Passport showing collected stamps and progress.
7. The form showing field-level validation errors.
8. The form showing the successful validation message.
9. Mobile screenshots at 375px and 768px widths.

## Photo and library credits

Use `images/PHOTO_SOURCES.md` for image creators, source pages and licences. The Places page also contains an on-site photo-credit section. The report should acknowledge Wikimedia Commons photographs, Bootstrap, jQuery, Leaflet, OpenStreetMap, Google Fonts and OpenAI ChatGPT.

## Final checks before submission

- Copy the updated files into the existing Midterm repository; do not create a new project repository.
- Push commits before the deadline and do not commit after the deadline.
- Open the deployed GitHub Pages website and verify all three pages, navigation, images and interactions.
- Test the layout at 375px, 768px and 1280px; check that there is no horizontal scrolling or overlap.
- Test the route builder, passport, form errors/success, search, filters and jQuery effects.
- Capture the screenshots listed above and insert them into the report.
- Submit the ZIP and the report in the naming format required by the instructor.
