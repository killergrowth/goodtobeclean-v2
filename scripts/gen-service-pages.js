'use strict';
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'services');

const services = [
  {
    slug: 'air-duct-cleaning',
    title: 'Air Duct Cleaning',
    metaTitle: 'Air Duct Cleaning in Wichita & El Dorado, KS | Good To Be Clean',
    metaDesc: 'Professional air duct cleaning services in Wichita, El Dorado, and south-central Kansas. Remove dust, allergens, and contaminants from your HVAC system. Call (316) 320-6767.',
    hero: 'Breathe Cleaner Air with Professional Air Duct Cleaning',
    heroSub: 'Remove dust, allergens, mold spores, and contaminants from your HVAC system for healthier indoor air quality.',
    intro: "Your air ducts are the lungs of your home. Over time, they accumulate dust, pet dander, mold spores, pollen, and other airborne contaminants that circulate through your living spaces every time your HVAC system runs. Professional air duct cleaning from Good To Be Clean removes these pollutants at the source — improving your indoor air quality, reducing allergy symptoms, and helping your HVAC system run more efficiently.",
    benefits: [
      { icon: 'fa-lungs', title: 'Improved Indoor Air Quality', desc: 'Remove airborne allergens, dust, and contaminants that circulate through your home.' },
      { icon: 'fa-bolt', title: 'Better HVAC Efficiency', desc: 'Clean ducts allow your system to move air freely, reducing energy costs and wear.' },
      { icon: 'fa-shield-halved', title: 'Healthier Home Environment', desc: 'Reduce triggers for asthma, allergies, and respiratory conditions.' },
      { icon: 'fa-clock', title: 'Extended System Lifespan', desc: 'Less buildup means less strain on your HVAC equipment.' },
    ],
    process: [
      { step: '1', title: 'System Inspection', desc: 'We inspect your ductwork, vents, and HVAC equipment before starting.' },
      { step: '2', title: 'Agitation & Cleaning', desc: 'Specialized tools agitate and dislodge debris throughout the duct system.' },
      { step: '3', title: 'HEPA Vacuuming', desc: 'Powerful HEPA-filtered vacuum systems extract all loosened contaminants.' },
      { step: '4', title: 'Sanitization (Optional)', desc: 'EPA-registered antimicrobial treatment eliminates bacteria and mold growth.' },
    ],
    image: '/images/air-duct-cleaning.webp',
    imgAlt: 'Air duct cleaning technician at work',
  },
  {
    slug: 'carpet-cleaning',
    title: 'Carpet Cleaning',
    metaTitle: 'Carpet Cleaning in Wichita & El Dorado, KS | Good To Be Clean',
    metaDesc: 'Professional carpet cleaning services in Wichita, El Dorado, and Kansas. Hot water extraction, stain removal, pet odor treatment. Call (316) 320-6767 for a free estimate.',
    hero: 'Professional Carpet Cleaning That Goes Deeper',
    heroSub: 'Hot water extraction removes embedded soil, stains, pet odors, and allergens — leaving your carpets fresh, clean, and looking like new.',
    intro: "Regular vacuuming keeps surface dirt at bay, but it can't reach the embedded soil, bacteria, pet dander, and allergens that settle deep into carpet fibers over time. Our professional hot water extraction process penetrates deep into your carpets — lifting out contaminants that household equipment simply can't reach. The result is a cleaner, fresher, healthier carpet.",
    benefits: [
      { icon: 'fa-droplet-slash', title: 'Deep Stain Removal', desc: 'Our pre-treatment and extraction process breaks down and removes stubborn stains.' },
      { icon: 'fa-paw', title: 'Pet Odor Elimination', desc: 'Enzyme-based treatments neutralize pet odors at the source.' },
      { icon: 'fa-lungs', title: 'Allergen Reduction', desc: 'Remove dust mites, pollen, pet dander, and other allergens embedded in fibers.' },
      { icon: 'fa-star', title: 'Extends Carpet Life', desc: 'Regular professional cleaning removes abrasive particles that wear down carpet fibers.' },
    ],
    process: [
      { step: '1', title: 'Pre-Inspection', desc: 'We assess carpet type, stains, and traffic patterns to determine the right treatment.' },
      { step: '2', title: 'Pre-Treatment', desc: 'Targeted pre-spray loosens embedded soils and treats stained areas.' },
      { step: '3', title: 'Hot Water Extraction', desc: 'High-pressure hot water extracts deep-seated dirt, allergens, and cleaning solution.' },
      { step: '4', title: 'Spot Treatment & Grooming', desc: 'Remaining spots treated and carpet groomed for fast drying.' },
    ],
    image: '/images/clean-dirty-carpet.webp',
    imgAlt: 'Before and after carpet cleaning results',
  },
  {
    slug: 'fire-smoke-restoration',
    title: 'Fire & Smoke Restoration',
    metaTitle: 'Fire & Smoke Damage Restoration in Kansas | Good To Be Clean',
    metaDesc: 'IICRC-certified fire and smoke damage restoration in Wichita, El Dorado, and Kansas. Soot removal, odor elimination, structural restoration. Call (316) 320-6767 24/7.',
    hero: 'Fire & Smoke Damage Restoration Done Right',
    heroSub: 'Certified technicians handle everything from soot removal to structural restoration after a fire.',
    intro: "Fire damage is devastating, but the aftermath — soot, smoke odor, and hidden structural damage — can be just as harmful if not addressed properly. Good To Be Clean's IICRC-certified fire and smoke restoration team responds quickly to assess the full scope of damage and develop a comprehensive restoration plan.",
    benefits: [
      { icon: 'fa-house-circle-check', title: 'Complete Restoration', desc: 'From emergency response through final repairs — we handle the entire process.' },
      { icon: 'fa-wind', title: 'Smoke Odor Elimination', desc: 'Advanced techniques including ozone treatment and thermal fogging eliminate odors permanently.' },
      { icon: 'fa-file-invoice-dollar', title: 'Insurance Coordination', desc: 'We work directly with your insurance adjuster to document damage and streamline claims.' },
      { icon: 'fa-clock-rotate-left', title: '24/7 Emergency Response', desc: 'Available around the clock for emergency board-up and initial damage mitigation.' },
    ],
    process: [
      { step: '1', title: 'Emergency Response', desc: 'We arrive quickly to secure the property and prevent further damage.' },
      { step: '2', title: 'Damage Assessment', desc: 'Thorough documentation of fire, smoke, and water damage.' },
      { step: '3', title: 'Soot & Smoke Removal', desc: 'Specialized cleaning agents and techniques remove soot from all surfaces.' },
      { step: '4', title: 'Odor Treatment & Restoration', desc: 'Advanced odor elimination followed by structural repairs and final inspection.' },
    ],
    image: '/images/hero.jpg',
    imgAlt: 'Fire and smoke restoration professionals at work',
  },
  {
    slug: 'mold-remediation',
    title: 'Mold Remediation',
    metaTitle: 'Mold Remediation in Wichita & El Dorado, KS | Good To Be Clean',
    metaDesc: 'IICRC-certified mold inspection, containment, and removal in Wichita, El Dorado, and Kansas. Protect your family from mold health risks. Call (316) 320-6767.',
    hero: 'Professional Mold Remediation That Protects Your Home',
    heroSub: "IICRC-certified inspection, containment, and removal — protecting your family's health and your property's value.",
    intro: "Mold is more than an eyesore — it's a health hazard. Mold spores can trigger allergies, worsen asthma, and cause serious respiratory problems. Good To Be Clean's IICRC-certified mold remediation team follows strict industry protocols to safely contain, remove, and prevent mold from returning.",
    benefits: [
      { icon: 'fa-microscope', title: 'Thorough Inspection', desc: 'We identify all mold growth — including hidden areas behind walls and in crawl spaces.' },
      { icon: 'fa-box', title: 'Proper Containment', desc: 'Negative air pressure and physical barriers prevent cross-contamination during removal.' },
      { icon: 'fa-certificate', title: 'IICRC S520 Certified Process', desc: 'We follow the industry gold standard for professional mold remediation.' },
      { icon: 'fa-ban', title: 'Prevent Recurrence', desc: 'We address the moisture source to prevent mold from returning after remediation.' },
    ],
    process: [
      { step: '1', title: 'Inspection & Testing', desc: 'Visual inspection and air/surface sampling to identify the type and extent of mold.' },
      { step: '2', title: 'Containment', desc: 'Physical barriers and negative air pressure prevent spore spread during remediation.' },
      { step: '3', title: 'Removal & Treatment', desc: 'HEPA vacuuming, antimicrobial treatment, and removal of affected materials.' },
      { step: '4', title: 'Clearance Testing', desc: 'Post-remediation verification ensures the area meets safe air quality standards.' },
    ],
    image: '/images/hidden-mold.jpg',
    imgAlt: 'Mold remediation in a Kansas home',
  },
  {
    slug: 'soda-blasting',
    title: 'Soda Blasting',
    metaTitle: 'Soda Blasting Services in Kansas | Good To Be Clean',
    metaDesc: 'Professional soda blasting for mold removal, fire damage cleanup, and surface restoration in Wichita, El Dorado, and Kansas. Eco-friendly and non-destructive. Call (316) 320-6767.',
    hero: 'Soda Blasting: Powerful, Eco-Friendly Surface Restoration',
    heroSub: 'Remove mold, soot, and coatings without damaging the underlying surface — the smarter choice for restoration work.',
    intro: "Soda blasting uses food-grade sodium bicarbonate propelled at high pressure to clean and restore surfaces without causing damage to the material underneath. It's the preferred technique for removing mold from wood framing, soot from fire-damaged structures, and old coatings where sandblasting would cause damage.",
    benefits: [
      { icon: 'fa-leaf', title: 'Eco-Friendly & Non-Toxic', desc: 'Food-grade sodium bicarbonate is safe for the environment and non-toxic.' },
      { icon: 'fa-shield-halved', title: 'Non-Destructive', desc: 'Cleans without pitting, warping, or damaging wood, brick, or masonry.' },
      { icon: 'fa-spray-can', title: 'No Secondary Contamination', desc: 'Water-soluble media dissolves and rinses away cleanly.' },
      { icon: 'fa-star', title: 'Versatile Applications', desc: 'Effective on mold, soot, fire damage, graffiti, old paint, and biological growth.' },
    ],
    process: [
      { step: '1', title: 'Surface Assessment', desc: 'We evaluate the surface type and contamination to select the right pressure and media.' },
      { step: '2', title: 'Containment Setup', desc: 'Area is contained to prevent media spread and cross-contamination.' },
      { step: '3', title: 'Soda Blasting', desc: 'High-pressure soda blasting removes mold, soot, or coatings from the surface.' },
      { step: '4', title: 'Cleanup & Treatment', desc: 'Residual media is removed and antimicrobial treatment applied as needed.' },
    ],
    image: '/images/about.webp',
    imgAlt: 'Soda blasting technician at work in Kansas',
  },
  {
    slug: 'vapor-barrier',
    title: 'Vapor Barrier Installation',
    metaTitle: 'Vapor Barrier Installation in Kansas | Good To Be Clean',
    metaDesc: 'Professional vapor barrier installation for crawl spaces and basements in Wichita, El Dorado, and Kansas. Prevent moisture, mold, and structural damage. Call (316) 320-6767.',
    hero: 'Vapor Barrier Installation for Dry, Healthy Crawl Spaces',
    heroSub: 'Stop moisture at the source — professional vapor barrier installation protects your home from mold, rot, and structural damage.',
    intro: "Moisture in crawl spaces and basements is one of the leading causes of mold growth and structural damage in Kansas homes. A properly installed vapor barrier stops ground moisture before it can enter your living space — reducing humidity, preventing mold, and protecting wood framing and insulation from rot.",
    benefits: [
      { icon: 'fa-droplet-slash', title: 'Moisture Control', desc: 'Stop ground moisture from entering your crawl space and affecting your living areas.' },
      { icon: 'fa-shield-halved', title: 'Mold Prevention', desc: 'Reduced moisture means reduced risk of mold growth in crawl spaces and basements.' },
      { icon: 'fa-house', title: 'Protect Structural Integrity', desc: 'Prevent rot and deterioration in wood framing, joists, and insulation.' },
      { icon: 'fa-bolt', title: 'Improved Energy Efficiency', desc: 'Drier crawl spaces mean better insulation performance and lower energy bills.' },
    ],
    process: [
      { step: '1', title: 'Crawl Space Inspection', desc: 'We assess moisture levels, existing damage, and crawl space conditions.' },
      { step: '2', title: 'Prep & Cleanup', desc: 'Debris removal, mold treatment if needed, and surface preparation.' },
      { step: '3', title: 'Barrier Installation', desc: 'Heavy-duty poly vapor barrier installed and sealed to walls and piers.' },
      { step: '4', title: 'Final Inspection', desc: 'Thorough inspection to ensure complete coverage and proper sealing.' },
    ],
    image: '/images/about.webp',
    imgAlt: 'Vapor barrier installation in Kansas crawl space',
  },
  {
    slug: 'water-damage-restoration',
    title: 'Water Damage Restoration',
    metaTitle: 'Water Damage Restoration in Wichita & El Dorado, KS | Good To Be Clean',
    metaDesc: '24/7 water damage restoration in Wichita, El Dorado, and Kansas. Emergency water extraction, structural drying, and complete restoration. IICRC certified. Call (316) 320-6767.',
    hero: '24/7 Water Damage Restoration in Kansas',
    heroSub: 'Fast emergency response, professional water extraction, and complete structural restoration to get your home back to normal.',
    intro: "Water damage can happen in an instant — a burst pipe, a flooded basement, an appliance failure. But the damage it causes develops over hours and days. Within 24 hours, mold can begin to grow. That's why fast response is critical. Good To Be Clean's IICRC-certified team responds 24/7 to extract water, dry out your structure, and restore your home before secondary damage occurs.",
    benefits: [
      { icon: 'fa-clock-rotate-left', title: '24/7 Emergency Response', desc: 'We respond immediately — day or night — to begin water extraction and damage mitigation.' },
      { icon: 'fa-certificate', title: 'IICRC S500 Certified', desc: 'We follow the industry standard for professional water damage restoration.' },
      { icon: 'fa-file-invoice-dollar', title: 'Insurance Assistance', desc: 'We document damage and work directly with your insurance company.' },
      { icon: 'fa-house-circle-check', title: 'Complete Restoration', desc: 'From emergency extraction through structural repairs — we handle the entire process.' },
    ],
    process: [
      { step: '1', title: 'Emergency Response', desc: 'We arrive within hours to begin water extraction and prevent further damage.' },
      { step: '2', title: 'Water Extraction', desc: 'Truck-mounted and portable extractors remove standing water from all affected areas.' },
      { step: '3', title: 'Structural Drying', desc: 'Industrial air movers and dehumidifiers dry walls, floors, and structural materials.' },
      { step: '4', title: 'Restoration & Repairs', desc: 'Once dry, we restore damaged materials, drywall, flooring, and finishes.' },
    ],
    image: '/images/hero.jpg',
    imgAlt: 'Water damage restoration team at work in Kansas',
  },
  {
    slug: 'restoration-services',
    title: 'Restoration Services',
    metaTitle: 'Restoration Services in Wichita & El Dorado, KS | Good To Be Clean',
    metaDesc: 'Full-spectrum property restoration services in Wichita, El Dorado, and Kansas. Water, fire, mold, and general property restoration by IICRC-certified professionals. Call (316) 320-6767.',
    hero: 'Complete Property Restoration Services in Kansas',
    heroSub: 'From emergency response through full rebuilding — Good To Be Clean handles every phase of property restoration.',
    intro: "When disaster strikes — whether it's water, fire, mold, or storm damage — recovery requires more than cleanup. True restoration means returning your property to its pre-loss condition. Good To Be Clean provides comprehensive restoration services that cover the full spectrum: emergency mitigation, structural drying, cleaning, repairs, and final finishing.",
    benefits: [
      { icon: 'fa-house-circle-check', title: 'Full-Spectrum Service', desc: 'One company handles everything — no juggling multiple contractors.' },
      { icon: 'fa-certificate', title: 'IICRC Certified', desc: 'Certified in water, fire, mold, and carpet restoration — the complete package.' },
      { icon: 'fa-file-invoice-dollar', title: 'Insurance Coordination', desc: 'We work with adjusters and document everything needed to support your claim.' },
      { icon: 'fa-clock-rotate-left', title: '24/7 Availability', desc: 'Emergency response around the clock for any restoration situation.' },
    ],
    process: [
      { step: '1', title: 'Initial Assessment', desc: 'Comprehensive damage assessment and documentation for insurance and planning.' },
      { step: '2', title: 'Emergency Mitigation', desc: 'Immediate action to stop ongoing damage — water extraction, board-up, containment.' },
      { step: '3', title: 'Cleaning & Remediation', desc: 'Professional cleaning of all affected materials — structural, content, and HVAC.' },
      { step: '4', title: 'Restoration & Rebuild', desc: 'Structural repairs, finishing, and final inspection to return your property to pre-loss condition.' },
    ],
    image: '/images/hero.jpg',
    imgAlt: 'Good To Be Clean restoration team at work',
  },
];

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function generatePage(s) {
  const benefitsHtml = s.benefits.map(b => `
        <div class="col-sm-6 mb-3">
          <div class="why-item">
            <div class="why-icon"><i class="fa-solid ${b.icon}"></i></div>
            <div class="why-content"><h4>${b.title}</h4><p>${b.desc}</p></div>
          </div>
        </div>`).join('');

  const processHtml = s.process.map(p => `
        <div class="col-sm-6 col-lg-3">
          <div style="background:#f7f8fc; border-radius:8px; padding:24px; height:100%; border-top:4px solid #d32f2f;">
            <div style="font-size:2rem; font-weight:700; color:#d32f2f; line-height:1; margin-bottom:12px;">${p.step}</div>
            <h4 style="font-size:1rem; color:#000e39; margin-bottom:8px;">${p.title}</h4>
            <p style="font-size:14px; color:#555; margin:0;">${p.desc}</p>
          </div>
        </div>`).join('');

  return `<!--
  BUILD:meta
  title: ${s.metaTitle}
  description: ${s.metaDesc}
  canonical: https://goodtobeclean-v2.pages.dev/services/${s.slug}/
-->
<!DOCTYPE html>
<html lang="en" id="top">
<head>
<!-- HEAD -->
</head>
<body>
<!-- HEADER -->
<main>
  <div class="g2bc-breadcrumb"><div class="container"><ol><li><a href="/">Home</a></li><li><a href="/services/">Services</a></li><li><span class="current">${s.title}</span></li></ol></div></div>

  <section class="page-hero">
    <div class="container">
      <h1>${s.hero}</h1>
      <p>${s.heroSub}</p>
    </div>
  </section>

  <section class="section-padded section-light">
    <div class="container">
      <div class="row align-items-center gy-5">
        <div class="col-lg-6">
          <p class="section-label">${s.title}</p>
          <h2>Professional ${s.title} in Kansas</h2>
          <p>${s.intro}</p>
          <div class="d-flex gap-3 flex-wrap mt-4">
            <a href="tel:+13163206767" class="btn-primary-g2bc"><i class="fa-solid fa-phone me-2"></i>Call (316) 320-6767</a>
            <a href="/contact/" class="btn-secondary-g2bc" style="color:#000e39; border-color:#000e39;">Free Estimate</a>
          </div>
        </div>
        <div class="col-lg-6">
          <img src="${s.image}" alt="${s.imgAlt}" class="img-fluid rounded" style="box-shadow:0 8px 32px rgba(0,14,57,0.12);" loading="lazy" width="600" height="400">
        </div>
      </div>
    </div>
  </section>

  <section class="section-padded section-gray">
    <div class="container">
      <p class="section-label text-center">Why Choose Us</p>
      <h2 class="section-title text-center">Benefits of Professional ${s.title}</h2>
      <div class="row gy-3 mt-4">${benefitsHtml}
      </div>
    </div>
  </section>

  <section class="section-padded section-light">
    <div class="container">
      <p class="section-label text-center">How It Works</p>
      <h2 class="section-title text-center">Our ${s.title} Process</h2>
      <div class="row gy-4 mt-4">${processHtml}
      </div>
    </div>
  </section>

  <section class="section-padded section-gray">
    <div class="container">
      <p class="section-label text-center">Service Area</p>
      <h2 class="section-title text-center">${s.title} Across Kansas</h2>
      <p class="section-subtitle text-center">We serve communities throughout south-central Kansas including Wichita, El Dorado, Andover, Derby, Newton, Hutchinson, and more.</p>
      <div class="text-center mt-4">
        <a href="/areas-served/" class="btn-primary-g2bc">View All Service Areas</a>
      </div>
    </div>
  </section>

  <section class="cta-banner">
    <div class="container">
      <h2>Ready to Schedule Your ${s.title}?</h2>
      <p>Free estimates. No obligation. Available 24/7 for emergencies across south-central Kansas.</p>
      <div class="d-flex gap-3 justify-content-center flex-wrap">
        <a href="tel:+13163206767" class="btn-primary-g2bc"><i class="fa-solid fa-phone me-2"></i>Call (316) 320-6767</a>
        <a href="/contact/" class="btn-secondary-g2bc">Request Free Estimate</a>
      </div>
    </div>
  </section>
</main>
<!-- FOOTER -->
</body>
</html>`;
}

let count = 0;
for (const s of services) {
  const dir = path.join(BASE, s.slug);
  fs.mkdirSync(dir, { recursive: true });
  const content = generatePage(s);
  fs.writeFileSync(path.join(dir, 'index.src.html'), content, 'utf8');
  console.log('Written: services/' + s.slug + '/index.src.html (' + content.length + ' bytes)');
  count++;
}
console.log('\nDone — ' + count + ' service hub pages generated.');
