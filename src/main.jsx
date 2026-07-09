import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Play,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { WHATSAPP_ORDER_NUMBER } from "./storeProducts";
import { usePublicBlogPosts, usePublicCatalog } from "./publicCatalog";
import "./styles.css";

const navItems = [
  ["Inspiring Tradition", "tradition"],
  ["Design", "design"],
  ["Bespoke", "bespoke"],
  ["Accessories", "accessories"],
  ["Store", "store"],
  ["Trends & News", "blog"],
];

const logoUrl =
  "/images/hinkro-kente-bespoke-kente-weaving-services-logo.png";

const slides = [
  {
    image: "/images/bespoke-kente-weaving-services-hinkro-kente-loom.jpg",
    imageAlt:
      "Bespoke Kente weaving services by Hinkro Kente on a traditional loom",
    text: (
      <>
        Kente is not just a fabric;{" "}
        <strong>it is a work of art</strong>, hand-made to order exclusively
        just for you by our team of highly skilled craftsmen and designers.
      </>
    ),
  },
  {
    image: "/images/made-to-order-bespoke-kente-weaving-services.webp",
    imageAlt: "Made-to-order bespoke Kente weaving services in progress",
    text: (
      <>
        The start is <strong>understanding your dream</strong>. Then creating
        handmade sketches and illustrations for a physical weaving blueprint.
      </>
    ),
  },
  {
    image: "/images/authentic-bespoke-kente-weaving-services-ghana.jpg",
    imageAlt: "Authentic Ghanaian bespoke Kente weaving services",
    text: (
      <>
        We inspire tradition at the very core of Hinkro Kente, where{" "}
        <strong>Innovation</strong> and <strong>Aspiration</strong> unfold.
      </>
    ),
  },
];

const traditionCarouselItems = [
  {
    title: "Attention to details",
    image: "/images/inspiring-tradition-carousel-attention-details.jpg",
  },
  {
    title: "Craftmanship",
    image: "/images/inspiring-tradition-carousel-craftmanship.jpg",
  },
  {
    title: "Exclusivity for you",
    image: "/images/inspiring-tradition-carousel-exclusivity.jpg",
  },
  {
    title: "Tradition and new ways",
    image: "/images/inspiring-tradition-carousel-tradition-new-ways.jpg",
  },
];

const traditionCarouselCopy =
  "At Hinkro Kente, every masterpiece begins with passion, precision, and artistry. Our master weavers create kente cloths that are more than fabric — they are personal statements of elegance, woven to embody your story.";

const valueCards = [
  {
    title: "Royal-standard quality through stringent process",
    text: "At Hinkro Kente, we prioritize quality. Our custom kente cloth undergoes strict processes to meet high standards, akin to royalty.",
    image: "/images/inspiring-tradition-carousel-craftsmanship.jpg",
  },
  {
    title: "Customized accessories for a complete look",
    text: "Equip yourself in style for a complete look. Enhance your outfit with accessories that are well-designed, practical, and refined.",
    image: "/images/hinkro-value-card-customized-accessories.jpg",
  },
  {
    title: "Additional services from aisle to every occasion",
    text: "Enjoy Hinkro’s signature after-sales care, with style support and thoughtful transformations for meaningful occasions.",
    image: "/images/hinkro-value-card-additional-services.jpg",
  },
];

const trendsNewsImages = [
  {
    className: "trend-image-one",
    src: "/images/hinkro-kente-trends-news-purple-red-kente-gown.jpg",
    alt: "Bespoke Hinkro Kente purple and red gown inspiration",
  },
  {
    className: "trend-image-two",
    src: "/images/hinkro-kente-trends-news-yellow-bridal-kente.jpg",
    alt: "Yellow bridal Kente fashion inspiration by Hinkro Kente",
  },
  {
    className: "trend-image-three",
    src: "/images/hinkro-kente-trends-news-green-blue-kente-gown.jpg",
    alt: "Green and blue bespoke Kente gown trend inspiration",
  },
  {
    className: "trend-image-four",
    src: "/images/hinkro-kente-trends-news-peach-bespoke-kente-gown.jpg",
    alt: "Peach bespoke Kente gown trend inspiration",
  },
  {
    className: "trend-image-five",
    src: "/images/hinkro-kente-trends-news-silver-blue-kente-fan.jpg",
    alt: "Silver and blue Hinkro Kente gown with fan",
  },
  {
    className: "trend-image-six",
    src: "/images/hinkro-kente-trends-news-gold-garden-kente-gown.jpg",
    alt: "Gold garden bespoke Kente gown inspiration",
  },
];

const graduationStoleImages = [
  {
    src: "/images/graduation-stole/kente-graduation-stole-university-of-ghana-deborah.jpg",
    alt: "University of Ghana graduate wearing a custom Kente Graduation Stole",
  },
  {
    src: "/images/graduation-stole/kente-graduation-stole-custom-name-closeup.jpg",
    alt: "Close-up of a personalized Kente Graduation Stole with embroidered name",
  },
  {
    src: "/images/graduation-stole/kente-graduation-stole-red-dress-portrait.jpg",
    alt: "Graduate in red dress wearing a black authentic Kente Graduation Stole",
  },
  {
    src: "/images/graduation-stole/kente-graduation-stole-business-admin-portrait.jpg",
    alt: "Business Administration graduate wearing a personalized Kente Graduation Stole",
  },
  {
    src: "/images/graduation-stole/kente-graduation-stole-group-green-campus.jpg",
    alt: "Group of graduates wearing African Kente Graduation Stoles on campus",
  },
  {
    src: "/images/graduation-stole/kente-graduation-stole-group-honours-campus.jpg",
    alt: "Graduates in formal wear with authentic Kente Graduation Stoles and medals",
  },
  {
    src: "/images/graduation-stole/kente-graduation-stole-english-graduate.jpg",
    alt: "Female graduate smiling in cap and gown with a Kente Graduation Stole",
  },
  {
    src: "/images/graduation-stole/kente-graduation-stole-personalized-name.jpg",
    alt: "Graduate presenting a personalized Kente Graduation Stole and sash",
  },
  {
    src: "/images/graduation-stole/kente-graduation-stole-jeffery-suit.jpg",
    alt: "Male graduate in suit wearing a black and gold Kente Graduation Stole",
  },
  {
    src: "/images/graduation-stole/kente-graduation-stole-koforidua-technical-university-portrait.jpg",
    alt: "Koforidua Technical University graduate wearing a custom Kente Graduation Stole",
  },
];

const graduationFeatureSections = [
  {
    title: "Authentic Craftsmanship",
    cta: "Design Process",
    image: graduationStoleImages[0],
    text: "Every Kente Graduation Stole and sash is woven with patient craftsmanship, rich Ghanaian heritage, and ceremonial detail. Hinkro Kente creates graduation stoles that feel personal, photograph beautifully, and carry the pride of your academic journey.",
  },
  {
    title: "Premium Quality",
    image: graduationStoleImages[1],
    text: "Our Kente Graduation Stole pieces are made with premium yarns, durable finishing, clean embroidery, and carefully selected colors. The result is a graduation sash that remains elegant in portraits, procession photos, family celebrations, and keepsake memories.",
  },
  {
    title: "Unique Designs",
    cta: "Bespoke",
    image: graduationStoleImages[9],
    text: "Choose your school colors, program details, name, class year, institutional crest, symbols, stripes, and custom Kente patterns. A personalized Kente Graduation Stole lets every graduate celebrate achievement with identity and meaning.",
  },
  {
    title: "Perfect for Photos",
    image: graduationStoleImages[3],
    text: "A Hinkro Kente Graduation Stole gives your graduation pictures a bold cultural statement. Whether you are taking studio portraits, campus photos, family images, or convocation shots, the stole completes your look with elegance.",
  },
];

const graduationFaqItems = [
  {
    question: "What is a Kente Graduation Stole?",
    answer:
      "A Kente Graduation Stole is a ceremonial sash worn over a graduation gown to represent achievement, heritage, school pride, and personal identity. Hinkro Kente creates authentic African Kente Graduation Stoles with custom colors, names, programs, crests, and class details.",
  },
  {
    question: "Who wears a Kente Graduation Stole or sash?",
    answer:
      "Graduates from universities, colleges, high schools, professional programs, and student associations wear Kente Graduation Stoles. They are also popular for group orders, class sets, departments, international students, and Ghanaian or African graduation celebrations.",
  },
  {
    question: "How do you make the Kente Graduation Stole?",
    answer:
      "We begin with your preferred colors, wording, symbols, crest, and design direction. The Kente is woven and finished by skilled artisans, then personalized with the graduate’s details so the final stole or sash feels distinctive and photo-ready.",
  },
  {
    question: "How can I order a Kente Graduation Stole for myself?",
    answer:
      "Use the WhatsApp order button on this page to send us your school, program, name, colors, deadline, and quantity. Our team will confirm the design direction, lead time, pricing, and delivery options before production begins.",
  },
  {
    question: "How long does it take to finish a Kente Graduation Stole?",
    answer:
      "Lead time depends on the design complexity, quantity, season, and rush-order availability. We recommend ordering early before graduation season so your Kente Graduation Stole can be woven, personalized, reviewed, and delivered without pressure.",
  },
  {
    question: "What is the price for a Kente Graduation Stole or sash?",
    answer:
      "Pricing depends on the size, design complexity, embroidery, crest work, quantity, and deadline. Message Hinkro Kente on WhatsApp with your preferred Kente Graduation Stole details and we will provide the right estimate.",
  },
  {
    question: "Do you ship Kente Graduation Stoles abroad?",
    answer:
      "Yes. Hinkro Kente supports local and international clients. Share your destination and deadline when you order so we can advise on production timing and delivery arrangements for your graduation stole or sash.",
  },
];

const designProcessSteps = [
  {
    number: "1",
    title: "Consultation",
    text: "This initial step involves meeting with the client to understand their needs, preferences, and any specific requirements for the kente design.",
  },
  {
    number: "2",
    title: "Concept and Design",
    text: "Based on the consultation, Hinkro Kente develops a concept and design for the kente cloth. This includes selecting patterns, colors, and symbols that align with the client's vision.",
  },
  {
    number: "3",
    title: "Client Approval",
    text: "The proposed design is presented to the client for feedback and approval. Any necessary adjustments are made to ensure the client's satisfaction before proceeding.",
  },
  {
    number: "4",
    title: "Weaving",
    text: "Once the design is approved, the yarns are prepared according to the specified colors and patterns. Skilled weavers then begin the intricate process of weaving the kente cloth on traditional looms.",
  },
  {
    number: "5",
    title: "Sample Weave Inspection",
    text: "A sample of the woven kente is inspected to ensure it meets the quality standards and design specifications. Any issues identified are addressed before continuing with the full weaving process.",
  },
  {
    number: "6",
    title: "Finishing",
    text: "The final kente cloth undergoes finishing touches, which may include washing, ironing, and trimming. This step ensures the cloth is in perfect condition and ready for delivery.",
  },
];

const designOfferings = [
  {
    title: "Pattern Weave",
    text: "Hinkro Kente offers a variety of meticulously crafted kente designs with intricate patterns and vibrant colors. Each design has unique symbolism and meaning, catering to classic and contemporary tastes. The weaving process ensures high-quality pieces. Hinkro Kente guarantees authentic and beautifully crafted kente cloth.",
    image: "/images/hinkro-design-offering-pattern-weave.webp",
    imageAlt: "Emerald green and peach Hinkro Kente pattern weave fabric",
    layout: "image-first",
  },
  {
    title: "Plain Weave",
    text: "Hinkro Kente offers traditional Ghanaian plain kente weaving services for customizing cloth with unique patterns and colors to match any desirable pattern fabric.",
    image: "/images/hinkro-design-offering-plain-weave.webp",
    imageAlt: "Cream and silver shimmering Hinkro Kente plain weave fabric",
    layout: "text-first",
  },
  {
    title: "Transitional Weave (Ombre)",
    text: "Ombre Kente weaving blends different colors gradually from light to dark, adding depth to traditional Kente cloth. Hinkro Kente Design offers skilled weavers who create intricate Ombre patterns using high-quality materials.",
    image: "/images/hinkro-design-offering-transitional-ombre-weave.webp",
    imageAlt: "Yellow purple and green ombre Hinkro Kente fabric",
    layout: "image-first",
    cta: true,
  },
  {
    title: "Weaving + Mechanical Embroidery",
    text: "Hinkro Kente combines traditional handloom weaving with modern mechanical embroidery to create unique and innovative designs. This blend of techniques adds depth and texture to their fabrics, showcasing Ghanaian craftsmanship.",
    image: "/images/hinkro-design-offering-mechanical-embroidery.jpeg",
    imageAlt: "Orange Kente cloth with mechanical embroidery symbols",
    layout: "text-first",
  },
  {
    title: "Weaving + Hand Embroidery",
    text: "At Hinkro Kente, we combine weaving and hand embroidery to create unique kente cloth designs that blend tradition and artistry. Our skilled artisans use traditional weaving methods to craft the base fabric, which is then enhanced with hand embroidery to add intricate details. This fusion of techniques results in exclusive pieces that highlight Ghanaian textile traditions, offering both traditional and modern designs.",
    image: "/images/hinkro-design-offering-hand-embroidery.jpg",
    imageAlt: "Green and gold Kente fabric with white hand embroidery",
    layout: "text-first",
  },
  {
    title: "Graduation Stoles and Sash",
    text: "We offer custom weaving graduation stoles that symbolize academic achievements. Our high-quality stoles are tailored to each graduate's preferences, incorporating design elements like school colors and logos.",
    image: "/images/hinkro-design-offering-graduation-stoles.jpg",
    imageAlt: "Custom graduation stole and sash by Hinkro Kente",
    layout: "text-first",
    cta: true,
    ctaHref: "#graduation",
  },
];

const historyItems = [
  {
    year: "2018",
    text: "Since our beginning in 2018, our goal has always been to create customized kente fabrics that look great in design and rich in culture. We began by offering already-made designs loved by early customers.",
  },
  {
    year: "2020",
    text: "Work began in full pursuit of our goal. We secured three trusted weavers in addition to the Hinkro team and started producing customized orders with more structure and care.",
  },
  {
    year: "2022",
    text: "Sales, shipments, and customer reviews strengthened our reputation. Hinkro Kente’s rich designs and cultural detail were featured at executive traditional functions in Ghana.",
  },
  {
    year: "2024",
    text: "Hinkro Kente quickly established itself as a household name and cherished family legacy, attracting a growing number of exclusive clients through exceptional service and post-service care.",
  },
  {
    year: "2026",
    text: "Hinkro Kente continues to stand as one of Ghana’s trusted bespoke Kente services, growing with speed, refinement, and a clear promise: every piece must carry culture, story, and distinction.",
  },
];

const fallbackReviewItems = [
  {
    name: "Elsie Osei Agyapong",
    age: "1 year ago",
    rating: 5,
    text: "Made a perfect birthday gift 🎁 with very short notice. Updated me all the way. Great service! Great packaging too",
  },
  {
    name: "Akua Serwaa",
    age: "1 year ago",
    rating: 5,
    text: "Beautifully woven Kente with excellent finishing. The Hinkro team made the process easy and helped me choose the right colours.",
  },
  {
    name: "Kwame Boateng",
    age: "2 years ago",
    rating: 5,
    text: "Professional service and authentic quality. My family loved the final cloth and the delivery was handled with care.",
  },
];

let googleMapsScriptPromise;

function loadGoogleMapsScript(apiKey) {
  if (window.google?.maps?.places) {
    return Promise.resolve(window.google);
  }

  if (googleMapsScriptPromise) {
    return googleMapsScriptPromise;
  }

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    const callbackName = `initHinkroGoogleReviews${Date.now()}`;
    const script = document.createElement("script");

    window[callbackName] = () => {
      delete window[callbackName];
      resolve(window.google);
    };

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => reject(new Error("Google Reviews could not load."));
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}

const faqItems = [
  {
    question: "What is Kente cloth or fabric ?",
    answer:
      "Kente cloth is a traditional Ghanaian textile made from silk, cotton, rayon or polyester, known for vibrant colors and intricate geometric patterns. Each design has cultural significance, representing history, social status, values, heritage, prestige, and pride.",
  },
  {
    question: "How are Kente cloth made ?",
    answer:
      "Kente cloth is made by weaving narrow strips of fabric on a loom, combining silk or cotton threads into intricate patterns. These strips are then sewn together to create larger pieces, requiring skilled craftsmanship and careful attention to detail.",
  },
  {
    question: "What is the price for Kente cloth ?",
    answer:
      "At Hinkro, the price of Kente cloth varies depending on pattern complexity, materials, and fabric size. Kente can range from around $70 to several hundred dollars per piece, with authentic handwoven Kente costing more than wax print versions.",
  },
  {
    question: "Do you produce original or authentic Kente for Engagement ?",
    answer:
      "Yes. Hinkro Kente produces authentic, handwoven Kente cloth, combining traditional craftsmanship with modern design techniques to ensure originality and high quality in every piece.",
  },
  {
    question: "Where are you located ?",
    answer:
      "Hinkro Kente is based in Accra, Ghana, specifically in Ablekuma, where our weaving studio is located. We also have a presence in Atlanta, Georgia, in the United States, and Leicester in the United Kingdom.",
  },
  {
    question: "I want a kente fabric made in my preferred colors ?",
    answer:
      "Hinkro Kente produces Kente fabric in customers’ preferred colors, offering personalized designs for individual tastes and special requests while maintaining the authenticity of traditional weaving.",
  },
  {
    question: "Do you ship outside Ghana ?",
    answer: "Yes! We ship to any country in the world.",
  },
  {
    question: "What are the steps in acquiring a kente from you ?",
    answer:
      "Customers begin by booking an appointment with Hinkro for a fee of $50. During the appointment, they discuss preferred colors, patterns, and design requirements, choose from existing designs or request a custom pattern, receive a quote, and wait for the handcrafted Kente to be produced and delivered.",
  },
];


const bespokeServiceRows = [
  {
    title: "Custom Color-way",
    text: "Choose the colors that resonate with you the most, and we will intricately integrate them into a pre-existing design, resulting in a unique and personalized fabric that aligns perfectly with your individual style and preferences.",
    image: "/images/hinkro-bespoke-custom-color-way.jpg",
    imageAlt: "Color thread card for custom bespoke Kente color-way selection",
    cta: "View Color Card",
    layout: "image-first",
  },
  {
    title: "Story telling pattern",
    text: "We are dedicated to collaborating with you to bring your narrative to life in a personalized pattern. Our team of experienced craftsmen will engage with you to craft a one-of-a-kind design that encapsulates the essence of your background, accomplishments, or interests.",
    image: "/images/hinkro-bespoke-storytelling-pattern.jpg",
    imageAlt: "Designer sketching a storytelling Kente pattern for bespoke weaving",
    layout: "text-first",
  },
];

const bespokeFaqItems = [
  {
    question: "01. Do you have a shop ?",
    answer: "We do not have a shop; Hinkro is not in the business of selling already made Kente. Instead, we have a weaving studio where we primarily create custom and bespoke Kente fabrics. We also have a consultation office where we meet with clients to discuss their needs. Occasionally, we may create some popular and classic Kente for sale or curate rare and unique Kente from other weavers, which will be published and sold through our website and social media channels.",
  },
  {
    question: "02. Do you offer refund ?",
    answer: "Yes, we offer refunds in cases where there is a defect in production and insufficient time for corrections. However, consultation fees are non-refundable and deposits may become cancellation fees because of thread purchases, pattern development, and design hours already committed to your project. Our production process is designed to keep clients highly satisfied with the final result.",
  },
  {
    question: "03. Do you ship abroad ?",
    answer: "Yes, we ship internationally. To reduce the risk of losing your fabric, we ship directly to our representatives in the UK, US, and Canada, who then forward the package to your local address. For countries without representatives, we ship the fabric directly to you.",
  },
  {
    question: "04. What is the process of ordering for a custom made Kente ?",
    answer: "To order bespoke fabric, first decide whether you want to change the colors of an existing pattern, develop a new pattern, or choose from Hinkro-developed patterns. Sketches are created to present your ideas for approval. Once the design and colors are approved, we proceed to weave your fabric and keep you updated with pictures and videos throughout the process.",
  },
  {
    question: "05. How long does it take to weave a Kente",
    answer: "After consultation and sketch approval, Kente weaving can take 4–10 weeks depending on the complexity of the pattern, number of yards, and gender specifications. We advise clients to start the process about six months ahead of the program.",
  },
  {
    question: "06. Do you take part payment?",
    answer: "Yes, we accept partial payments. Clients are required to pay a minimum of 60% of the total bill upfront, with the remaining 40% due upon completion. We do not accept payment in installments beyond this structure.",
  },
  {
    question: "07. What happens if the event for which the fabric was ordered does not proceed?",
    answer: "Since the fabric is custom-made specifically for you, it is important to be fully committed before production begins. Once we start crafting your fabric, we are unable to accept returns or cancellations for changes of mind, sponsorship by another party, program cancellations, or similar circumstances.",
  },
  {
    question: "08. Do you weave Kente graduation stole",
    answer: "Yes, we do. The minimum order quantity for Kente graduation stoles is 10 units.",
  },
];

const accessoryItems = [
  {
    category: "Ceremonial",
    title: "Kente Graduation Stole & Sash",
    image: "/images/graduation-stole/kente-graduation-stole-custom-name-closeup.jpg",
    hoverImage: "/images/graduation-stole/kente-graduation-stole-personalized-name.jpg",
    imageAlt: "Personalized Kente graduation stole with embroidered name",
    text: "Celebrate your achievement with a custom Kente graduation stole — woven in your school colours with your name, program, crest, and class year. A ceremonial keepsake that photographs beautifully and carries the pride of your journey.",
    availability: "Graduation Season · Group Orders Welcome",
    actions: [
      ["View Graduation Stoles", "#graduation"],
      ["Order on WhatsApp", "https://wa.me/233209707235"],
    ],
  },
  {
    category: "Protection and Storage",
    title: "Men Duffel Bag",
    image: "/images/hinkro-accessory-men-duffel-bag.jpg",
    hoverImage: "/images/hinkro-accessory-men-duffel-bag-product.jpg",
    imageAlt: "Hinkro men's duffel bag for Kente cloth protection and storage",
    text: "Effortlessly stylish and designed for the modern man, the Hinkro Men's Duffle Bag combines easy-carry convenience with spacious storage and premium protection for your Kente cloth. Crafted for those who demand both comfort and style, it’s the perfect companion for travel or everyday elegance.",
    availability: "All Male Kente",
    actions: [
      ["Start Men Bespoke", "https://wa.link/5sqlyv"],
      ["Get Duffel Bag", "https://www.hinkrokente.com/product/hinkro-men-duffel-bag/"],
    ],
  },
  {
    category: "Personal Lifestyle",
    title: "Bridal Electronic Hand Fan",
    image: "/images/hinkro-accessory-bridal-hand-fan.jpg",
    hoverImage: "/images/hinkro-accessory-bridal-hand-fan-product.jpg",
    imageAlt: "Bride holding Hinkro bridal electronic hand fan",
    text: "The ultimate blend of style and comfort for your big day. Designed to keep brides cool under the sun, it ensures you stay fresh, radiant, and sweat-free. A luxurious must-have accessory for every bride.",
    availability: "Coming Soon (Bridal Package Only)",
    actions: [
      ["Start Bridal Bespoke", "https://www.hinkrokente.com/kente-bridal-package/"],
      ["Get Fan", "https://www.hinkrokente.com/product/hinkro-hand-held-bridal-fan/"],
    ],
  },
  {
    category: "Protection and Storage",
    title: "Bridal Garment Bag",
    image: "/images/hinkro-accessory-bridal-garment-bag.jpg",
    hoverImage: "/images/hinkro-accessory-gown-bag-product.jpg",
    imageAlt: "Hinkro bridal garment bag for Kente gown protection",
    text: "Your dream Kente gown deserves first class care. Designed to keep your gown safe, spotless, and ready for your big moment, it’s the elegant companion every bride deserves.",
    availability: "Bridal Package Only",
    actions: [
      ["Start Bridal Bespoke", "https://www.hinkrokente.com/kente-bridal-package/"],
      ["Get Garment Bag", "https://www.hinkrokente.com/product/bridal-gown-bag/"],
    ],
  },
  {
    category: "Fragrance",
    title: "Hinkro Moonlight Eau De Parfum 30ml",
    image: "/images/hinkro-accessory-moonlight-perfume.jpg",
    hoverImage: "/images/hinkro-accessory-moonlight-perfume-product.jpg",
    imageAlt: "Bride wearing Kente accessories and holding Hinkro Moonlight perfume",
    text: "Every bride deserves to smell as beautiful as she looks. A delicate blend of charm and allure, made for the bride who wants to leave a trace of magic. With every spritz, it wraps you in a soft, luxurious scent that lingers long after the “I do.”",
    availability: "Coming Soon (Pre-Order Only)",
    actions: [["Coming Soon", "#accessories"]],
  },
  {
    category: "Protection and Storage",
    title: "Flip Box",
    image: "/images/hinkro-accessory-flip-box.jpg",
    imageAlt: "Hinkro flip box packaging for gifting Kente",
    text: "It’s the ideal packaging for gifting Kente in style. Because every timeless fabric deserves a box that speaks tradition and class. Designed for secure storage and stunning presentation.",
    availability: "All Female Weave",
    actions: [["Order Women Kente", "https://wa.me/p/7466245416760251/233209707235"]],
  },
];

const preferredStoreCategories = [
  "All",
  "Latest Kente cloth",
  "Modern kente",
  "Classic kente",
  "Women's kente Cloth",
  "men's kente cloth",
  "Ombre Kente",
  "Accessories",
];

function getProductSlugFromLocation() {
  const path = window.location.pathname;
  const productMatch = path.match(/^\/product\/([^/]+)\/?$/);
  if (productMatch) return productMatch[1];

  const hash = window.location.hash.replace("#", "");
  const hashMatch = hash.match(/^store\/product\/([^/]+)$/);
  if (hashMatch) return hashMatch[1];

  return "";
}

function getPreferredCurrency() {
  const locale = navigator.language || "";
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

  if (locale.toLowerCase().includes("-gh") || timeZone === "Africa/Accra") {
    return "ghana";
  }

  return "international";
}

function getDisplayPrice(product, currency) {
  const price = product.prices[currency] || product.prices.international;
  const symbol = currency === "ghana" ? "GH₵" : "$";

  if (!price?.min) return "Chat for price";

  const formatAmount = (amount) =>
    new Intl.NumberFormat("en-US", {
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);

  if (!price.max || price.max === price.min) {
    return `${symbol}${formatAmount(price.min)}`;
  }

  return `${symbol}${formatAmount(price.min)} – ${symbol}${formatAmount(price.max)}`;
}

function getWhatsAppUrl(product) {
  const message = [
    `Hello Hinkro Kente, I am interested in ${product.name}.`,
    `Product URL: ${product.sourceUrl}`,
    "Please share availability, delivery options, and how to order.",
  ].join("\n");

  return `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent(message)}`;
}

function getGraduationOrderUrl() {
  const message = [
    "Hello Hinkro Kente, I am interested in ordering a Kente Graduation Stole or sash.",
    "Page: https://www.hinkrokente.com/authentic-african-kente-graduation-stole-sashe/",
    "Please share design options, pricing, lead time, and delivery details.",
  ].join("\n");

  return `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent(message)}`;
}

function cleanStoreCopy(text = "") {
  return text
    .replace(/\[njwa_button[^\]]*\]/gi, "")
    .replace(/selected shipping option at checkout/gi, "preferred delivery option")
    .replace(/at checkout/gi, "during order confirmation")
    .replace(/checkout/gi, "order confirmation")
    .replace(/\s+/g, " ")
    .trim();
}

function usePageSeo(title, description, keywords = []) {
  useEffect(() => {
    const previousTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const previousDescription = metaDescription?.getAttribute("content") || "";
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const previousKeywords = metaKeywords?.getAttribute("content") || "";

    document.title = title;
    if (metaDescription) metaDescription.setAttribute("content", description);
    if (metaKeywords) metaKeywords.setAttribute("content", keywords.join(", "));

    return () => {
      document.title = previousTitle;
      if (metaDescription) metaDescription.setAttribute("content", previousDescription);
      if (metaKeywords) metaKeywords.setAttribute("content", previousKeywords);
    };
  }, [description, keywords, title]);
}

function getCurrentPage() {
  const path = window.location.pathname;
  if (path === "/authentic-african-kente-graduation-stole-sashe/") return "graduation";
  if (path === "/authentic-kente-fabric/" || path.startsWith("/product/")) return "store";

  const hash = window.location.hash.replace("#", "");
  if (["tradition", "design", "bespoke", "accessories", "store", "graduation", "blog"].includes(hash)) return hash;
  if (hash.startsWith("store/")) return "store";
  return "home";
}

function Header({ currentPage }) {
  const [open, setOpen] = useState(false);
  const isHome = currentPage === "home" || currentPage === "graduation";

  return (
    <header className={`site-header ${isHome ? "home-header" : "inner-header"}`}>
      <a className="brand" href="#home" aria-label="Hinkro Kente home">
        <img src={logoUrl} alt="Hinkro Kente bespoke Kente weaving services" />
      </a>

      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map(([label, id]) => (
          <a
            key={id}
            href={`#${id}`}
            className={currentPage === id ? "is-active" : ""}
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="nav-actions">
        <a
          className="nav-portal"
          href="/portal"
          aria-label="Client and team portal"
          title="Client & team portal"
        >
          <PortalIcon />
        </a>
        <a className="nav-cta" href="https://hinkrokente.com/appointment/">
          Your Kente Awaits
        </a>
      </div>

      <button
        className="menu-toggle"
        type="button"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className="mobile-panel">
          <div className="mobile-panel-inner">
            <img
              className="mobile-panel-logo"
              src={logoUrl}
              alt="Hinkro Kente bespoke Kente weaving services"
            />

            <nav className="mobile-panel-nav" aria-label="Mobile navigation">
              {navItems.map(([label, id]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={currentPage === id ? "is-active" : ""}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </a>
              ))}
            </nav>

            <a className="mobile-panel-cta" href="https://hinkrokente.com/appointment/">
              Your Kente Awaits
            </a>

            <a
              className="mobile-panel-portal"
              href="/portal"
              onClick={() => setOpen(false)}
            >
              <PortalIcon />
              <span>Client &amp; team portal</span>
            </a>

            <div className="mobile-socials" aria-label="Social links">
              <a href="https://web.facebook.com/hinkro" aria-label="Facebook">
                f
              </a>
              <a href="https://www.pinterest.com/hinkrokente/" aria-label="Pinterest">
                x
              </a>
              <a href="https://www.instagram.com/hinkrokente/" aria-label="Instagram">
                ◎
              </a>
            </div>

            <p className="mobile-copyright">
              © Hinkro Kente 2025. All right reserved. Terms and Privacy.
              <br />
              Built and managed by Nusite IT Consulting Limited
            </p>
          </div>
        </div>
      )}
    </header>
  );
}

function AccessoriesPage() {
  return (
    <main className="accessories-page" id="accessories">
      <section className="accessories-intro" aria-labelledby="accessories-title">
        <h1 id="accessories-title">Discover Hinkro&apos;s Pivotal Accessories</h1>
        <p>
          Enrich every moment with a collection of accessories that cater to your
          unique lifestyle.
        </p>
      </section>

      <section className="accessories-grid-section" aria-label="Hinkro Kente accessories">
        <div className="accessories-grid">
          {accessoryItems.map((item) => (
            <article className="accessory-card" key={item.title}>
              <figure className="accessory-image">
                <img src={item.image} alt={item.imageAlt} />
                {item.hoverImage && <img className="accessory-hover-image" src={item.hoverImage} alt="" />}
              </figure>
              <p className="accessory-category">{item.category}</p>
              <h2>{item.title}</h2>
              <p className="accessory-description">{item.text}</p>
              <div className="accessory-divider" aria-hidden="true" />
              <p className="accessory-availability-label">Available For:</p>
              <p className="accessory-availability">{item.availability}</p>
              <div className="accessory-actions">
                {item.actions.map(([label, href]) => (
                  <a key={label} href={href}>
                    {label}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="accessories-dreams" aria-labelledby="accessories-dreams-title">
        <figure className="accessories-dreams-image">
          <img
            src="/images/hinkro-bespoke-dreams-shapes-hues.jpg"
            alt="Curated yellow and grey Kente fabric with Hinkro packaging"
          />
        </figure>
        <div className="accessories-dreams-copy">
          <h2 id="accessories-dreams-title">
            Dreams into
            <br />
            shapes and hues
          </h2>
          <p>
            Inspiring Greatness. For over 5 years, Hinkro has pushed the boundaries
            of luxury, creating new realities both within and beyond fabric design.
            We hope to impact and touch lives through quality services to our loyal
            consumers
          </p>
          <a href="https://hinkrokente.com/appointment/">
            Book Appointment <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
      <TrendsNewsSection />
    </main>
  );
}

function GraduationStolePage() {
  usePageSeo(
    "Kente Graduation Stole and Sash | Authentic African Graduation Stoles | Hinkro Kente",
    "Order an authentic Kente Graduation Stole or sash from Hinkro Kente. Custom African graduation stoles with names, school colors, crests, class year, symbols, and rush-order guidance.",
    [
      "Kente Graduation Stole",
      "Kente Graduation Sash",
      "African Kente Graduation Stole",
      "custom graduation stole Ghana",
      "personalized Kente graduation sash",
      "Hinkro Kente graduation stole",
    ],
  );

  return (
    <main className="graduation-page">
      <section className="graduation-hero" aria-labelledby="graduation-title">
        <video
          className="graduation-hero-video"
          src="/videos/kente-graduation-stole-sash-hero-video.mp4"
          poster={graduationStoleImages[2].src}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="graduation-hero-overlay" aria-hidden="true" />
        <div className="graduation-hero-content">
          <p>Kente Graduation Stole and Sash</p>
          <h1 id="graduation-title">
            Celebrate your achievements with authentic Kente Graduation Stoles and Sashes.
          </h1>
          <span>
            Each Kente Graduation Stole is woven with African artistry, personalized
            with meaning, and designed to help graduates stand out with pride,
            culture, and confidence.
          </span>
          <div className="graduation-hero-actions">
            <a href={getGraduationOrderUrl()}>
              Get Started <span aria-hidden="true">→</span>
            </a>
            <a href="#graduation-faq">View FAQ</a>
          </div>
        </div>
      </section>

      <section className="graduation-intro" aria-labelledby="graduation-intro-title">
        <p>Kente Graduation Stole</p>
        <h2 id="graduation-intro-title">
          A graduation stole that carries your school, story, colors, and heritage.
        </h2>
        <span>
          Hinkro Kente designs Kente Graduation Stoles and sashes for individual
          graduates, departments, associations, class groups, and international
          clients. From institutional crests and class years to names, programs,
          symbols, and colors, every Kente Graduation Stole is made to feel
          ceremonial, personal, and ready for the big day.
        </span>
      </section>

      <section className="graduation-features" aria-label="Kente Graduation Stole features">
        {graduationFeatureSections.map((feature, index) => (
          <article
            className={`graduation-feature ${index % 2 === 1 ? "is-reversed" : ""}`}
            key={feature.title}
          >
            <figure>
              <img src={feature.image.src} alt={feature.image.alt} />
            </figure>
            <div className="graduation-feature-copy">
              <h2>{feature.title}</h2>
              <p>{feature.text}</p>
              {feature.cta && (
                <a href={feature.cta === "Bespoke" ? "#bespoke" : "#design"}>
                  {feature.cta} <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          </article>
        ))}
      </section>

      <GraduationFaqSection />
      <GraduationGalleryCarousel />

      <section className="graduation-final-cta" aria-labelledby="graduation-final-title">
        <h2 id="graduation-final-title">
          Order your African Kente Graduation Stole and sash, make a statement on your big day,
          and create memories that last a lifetime.
        </h2>
        <a href={getGraduationOrderUrl()}>
          <WhatsAppIcon />
          Order Now
        </a>
      </section>
    </main>
  );
}

function GraduationFaqSection() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section className="graduation-faq-section" id="graduation-faq" aria-labelledby="graduation-faq-title">
      <h2 id="graduation-faq-title">FAQ</h2>
      <div className="graduation-faq-list">
        {graduationFaqItems.map((item, index) => (
          <article className="graduation-faq-item" key={item.question}>
            <button
              type="button"
              aria-expanded={openFaq === index}
              onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
            >
              <span>{String(index + 1).padStart(2, "0")}. {item.question}</span>
              <span aria-hidden="true">⌄</span>
            </button>
            <div className={openFaq === index ? "graduation-faq-answer is-open" : "graduation-faq-answer"}>
              <p>{item.answer}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function GraduationGalleryCarousel() {
  const loopImages = [...graduationStoleImages.slice(4), ...graduationStoleImages.slice(0, 4)];

  return (
    <section className="graduation-gallery-section" aria-labelledby="graduation-gallery-title">
      <div className="graduation-gallery-heading">
        <p>Kente Graduation Stole gallery</p>
        <h2 id="graduation-gallery-title">See how graduates wear the story.</h2>
      </div>
      <div className="graduation-gallery-carousel" aria-label="Kente Graduation Stole image carousel">
        {loopImages.map((image, index) => (
          <figure key={`${image.src}-${index}`}>
            <img src={image.src} alt={image.alt} loading="lazy" />
          </figure>
        ))}
      </div>
    </section>
  );
}

function StorePage({ productSlug }) {
  const { products, categories } = usePublicCatalog();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [catalogPage, setCatalogPage] = useState(1);
  const [currency] = useState(getPreferredCurrency);
  const storeCategoryFilters = useMemo(
    () =>
      preferredStoreCategories.filter(
        (category) => category === "All" || categories.includes(category),
      ),
    [categories],
  );

  const selectedProduct = productSlug
    ? products.find((product) => product.slug === productSlug)
    : null;

  usePageSeo(
    selectedProduct
      ? selectedProduct.seo.title
      : "Authentic Kente Fabric Store | Buy Ghana Kente by Color | Hinkro Kente",
    selectedProduct
      ? selectedProduct.seo.description
      : "Shop authentic Hinkro Kente fabrics by color, design, ceremony, and style. Browse authentic Kente by color and occasion, then chat on WhatsApp to order your preferred Kente cloth.",
    selectedProduct
      ? selectedProduct.seo.keywords
      : [
          "authentic Kente fabric",
          "buy Kente online",
          "Ghana Kente cloth",
          "handwoven Kente",
          "Hinkro Kente store",
        ],
  );

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.categories.includes(activeCategory);
      const searchable = [
        product.name,
        product.seo.description,
        product.seo.keywords.join(" "),
        product.categories.join(" "),
        product.colors.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && (!search || searchable.includes(search));
    });
  }, [activeCategory, products, query]);
  const totalCatalogPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const visibleProducts = filteredProducts.slice(
    (catalogPage - 1) * itemsPerPage,
    catalogPage * itemsPerPage,
  );

  useEffect(() => {
    setCatalogPage(1);
  }, [activeCategory, itemsPerPage, query]);

  if (selectedProduct) {
    return (
      <ProductDetailPage
        product={selectedProduct}
        currency={currency}
        products={products}
      />
    );
  }

  return (
    <main className="store-page" id="store">
      <section className="store-hero" aria-labelledby="store-title">
        <p className="store-kicker">Authentic Kente Fabric Store</p>
        <h1 id="store-title">
          Buy authentic Kente online — own a piece of tradition.
        </h1>
        <p>
          Shop handwoven Ghanaian Kente fabric, ready-to-wear pieces, and
          bespoke designs for weddings, engagements, graduations, and cultural
          celebrations. Find the Kente you love, then chat with us on WhatsApp
          to confirm availability, styling, delivery, and custom options.
        </p>
      </section>

      <section className="store-controls" aria-label="Store filters">
        <label className="store-search">
          <Search size={19} aria-hidden="true" />
          <span className="sr-only">Search products</span>
          <input
            type="search"
            value={query}
            placeholder="Search gold kente, engagement kente, graduation kente..."
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </section>

      <nav className="store-category-tabs" aria-label="Product categories">
        {storeCategoryFilters.map((category) => (
          <button
            type="button"
            key={category}
            className={activeCategory === category ? "is-active" : ""}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </nav>

      <section className="store-grid-section" aria-label="Products">
        <div className="store-results-line">
          <span>{filteredProducts.length} designs found · page {catalogPage} of {totalCatalogPages}</span>
          <label className="store-page-size">Show
            <select value={itemsPerPage} onChange={(event) => setItemsPerPage(Number(event.target.value))}>
              <option value={12}>12</option>
              <option value={20}>20</option>
              <option value={40}>40</option>
              <option value={filteredProducts.length || 1}>All</option>
            </select>
          </label>
        </div>

        <div className="store-grid">
          {visibleProducts.map((product) => (
            <ProductCard product={product} currency={currency} key={product.id} />
          ))}
        </div>
        {totalCatalogPages > 1 && (
          <Pagination
            page={catalogPage}
            totalPages={totalCatalogPages}
            onPageChange={setCatalogPage}
          />
        )}
      </section>

      <section className="store-seo-section" aria-labelledby="store-seo-title">
        <h2 id="store-seo-title">Buy authentic Kente fabric with confidence.</h2>
        <p>
          Hinkro Kente organizes every product around the colors buyers search for:
          blue Kente, gold Kente, green Kente, red Kente, pink Kente, ombre Kente,
          shimmering Kente, and ceremonial Kente cloth. Each product page keeps its
          original product URL, adds descriptive color keywords, and gives buyers a
          clear WhatsApp path to confirm the right weave before ordering.
        </p>
      </section>
    </main>
  );
}

function BlogPage() {
  const posts = usePublicBlogPosts();
  const [postsPerPage, setPostsPerPage] = useState(12);
  const [blogPage, setBlogPage] = useState(1);

  usePageSeo(
    "Kente Trends & News | Hinkro Kente",
    "Read Hinkro Kente trends, style inspiration, ceremony guidance, and bespoke Kente news.",
    ["Kente trends", "Kente news", "Hinkro Kente blog", "Ghana Kente inspiration"],
  );

  const fallbackPosts = trendsNewsImages.map((image, index) => ({
    id: image.src,
    title: [
      "Bespoke Kente colour inspiration",
      "Bridal Kente styling notes",
      "Ceremonial accessories and finishing touches",
      "Modern Kente silhouettes",
      "Statement fans and coordinated details",
      "Garden celebration Kente palettes",
    ][index],
    excerpt:
      "Explore Kente styling inspiration from Hinkro Kente while the editorial archive is being prepared.",
    featured_image: image.src,
  }));
  const visiblePosts = posts.length > 0 ? posts : fallbackPosts;
  const totalBlogPages = Math.max(1, Math.ceil(visiblePosts.length / postsPerPage));
  const pagedPosts = visiblePosts.slice(
    (blogPage - 1) * postsPerPage,
    blogPage * postsPerPage,
  );

  useEffect(() => {
    setBlogPage(1);
  }, [postsPerPage, posts.length]);

  return (
    <main className="store-page blog-page" id="blog">
      <section className="store-hero" aria-labelledby="blog-title">
        <p className="store-kicker">Trends & News</p>
        <h1 id="blog-title">Kente inspiration, styling notes, and studio stories.</h1>
        <p>
          Browse Hinkro Kente ideas for weddings, graduations, bespoke cloth,
          accessories, and refined ceremonial styling.
        </p>
      </section>

      <section className="store-grid-section" aria-label="Blog posts">
        <div className="store-results-line">
          <span>{visiblePosts.length} stories found · page {blogPage} of {totalBlogPages}</span>
          <label className="store-page-size">Show
            <select value={postsPerPage} onChange={(event) => setPostsPerPage(Number(event.target.value))}>
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={visiblePosts.length || 1}>All</option>
            </select>
          </label>
        </div>
        <div className="store-grid">
          {pagedPosts.map((post) => (
            <article className="store-product-card" key={post.id}>
              <div className="store-product-image">
                {post.featured_image && (
                  <img src={post.featured_image} alt={post.title} loading="lazy" />
                )}
              </div>
              <div className="store-product-copy">
                <p>Hinkro Kente</p>
                <h2>{post.title}</h2>
                <p className="store-product-seo">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
        {totalBlogPages > 1 && (
          <Pagination
            page={blogPage}
            totalPages={totalBlogPages}
            onPageChange={setBlogPage}
          />
        )}
      </section>
    </main>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  return (
    <nav className="store-pagination" aria-label="Pagination">
      <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      {pages.map((item) => (
        <button
          type="button"
          key={item}
          className={item === page ? "is-active" : ""}
          onClick={() => onPageChange(item)}
        >
          {item}
        </button>
      ))}
      <button type="button" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}

function WhatsAppIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M16.02 3.2A12.67 12.67 0 0 0 5.1 22.3L3.6 28.8l6.66-1.56A12.67 12.67 0 1 0 16.02 3.2Zm0 22.98c-1.92 0-3.77-.53-5.39-1.54l-.38-.24-3.95.92.9-3.85-.25-.4a10.27 10.27 0 1 1 9.07 5.1Zm5.64-7.68c-.31-.15-1.83-.9-2.12-1-.28-.1-.49-.15-.7.15-.2.31-.8 1-.98 1.2-.18.2-.36.23-.67.08-.31-.15-1.3-.48-2.48-1.52-.92-.82-1.54-1.83-1.72-2.14-.18-.31-.02-.48.13-.63.14-.13.31-.36.46-.54.15-.18.2-.31.31-.51.1-.2.05-.38-.03-.54-.08-.15-.7-1.69-.96-2.31-.25-.6-.51-.52-.7-.53h-.59c-.2 0-.54.08-.82.38-.28.31-1.08 1.06-1.08 2.57 0 1.52 1.1 2.98 1.26 3.19.15.2 2.18 3.33 5.28 4.67.74.32 1.31.51 1.76.65.74.24 1.41.2 1.95.12.59-.09 1.83-.75 2.09-1.47.26-.72.26-1.34.18-1.47-.08-.13-.28-.2-.59-.36Z"
      />
    </svg>
  );
}

function ProductCard({ product, currency }) {
  const image = product.images[0];
  const hoverImage = product.images.find((item) => item.role === "hover") || product.images[1];

  return (
    <article className="store-product-card">
      <a className="store-product-image" href={product.path} aria-label={`View ${product.name}`}>
        {image && <img src={image.src} alt={image.alt || product.name} loading="lazy" />}
        {product.isAccessory && hoverImage && <img className="store-product-hover-image" src={hoverImage.src} alt="" loading="lazy" />}
        {product.isAccessory && <span>Accessory</span>}
      </a>

      <div className="store-product-copy">
        <p>{product.categories[0] || "Hinkro Kente"}</p>
        <h2>
          <a href={product.path}>{product.name}</a>
        </h2>
        <div className="store-product-colors">
          {(product.colors.length ? product.colors : ["Kente"]).slice(0, 5).map((color) => (
            <span key={color}>{color}</span>
          ))}
        </div>
        <p className="store-product-seo">{product.seo.description}</p>
        <div className="store-product-bottom">
          <strong>{getDisplayPrice(product, currency)}</strong>
          <a className="store-whatsapp-link" href={getWhatsAppUrl(product)}>
            <WhatsAppIcon />
            Chat to order
          </a>
        </div>
      </div>
    </article>
  );
}

function ProductDetailPage({ product, currency, products }) {
  const [activeImage, setActiveImage] = useState(0);
  const currentImage = product.images[activeImage] || product.images[0];

  useEffect(() => {
    setActiveImage(0);
  }, [product.id]);

  const relatedProducts = products
    .filter(
      (item) =>
        item.id !== product.id &&
        item.categories.some((category) => product.categories.includes(category)),
    )
    .slice(0, 3);

  return (
    <main className="product-detail-page">
      <nav className="product-breadcrumb" aria-label="Breadcrumb">
        <a href="/#store">Store</a>
        <span aria-hidden="true">/</span>
        <span>{product.name}</span>
      </nav>

      <div className="product-back-wrap">
        <a className="product-back-link" href="/#store">
          <ChevronLeft size={18} aria-hidden="true" />
          Back to shop
        </a>
      </div>

      <section className="product-detail-hero" aria-labelledby="product-title">
        <div className="product-gallery">
          <figure className="product-main-image">
            {currentImage && <img src={currentImage.src} alt={currentImage.alt || product.name} />}
          </figure>
          {product.images.length > 1 && (
            <div className="product-thumbs" aria-label="Product gallery">
              {product.images.map((image, index) => (
                <button
                  type="button"
                  key={`${image.src}-${index}`}
                  className={activeImage === index ? "is-active" : ""}
                  onClick={() => setActiveImage(index)}
                  aria-label={`Show image ${index + 1}`}
                >
                  <img src={image.src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <article className="product-detail-copy">
          <p className="store-kicker">{product.categories[0] || "Hinkro Kente"}</p>
          <h1 id="product-title">{product.name}</h1>
          <p className="product-detail-intro">{product.seo.intro}</p>

          <div className="product-price-panel">
            <div>
              <span>Price</span>
              <strong>{getDisplayPrice(product, currency)}</strong>
            </div>
          </div>

          {product.variations.length > 0 && (
            <div className="product-variation-summary">
              <span>Available variations</span>
              <div>
                {product.variations.slice(0, 5).map((variation) => (
                  <a href="#product-options" key={variation.id}>
                    {variation.option}
                  </a>
                ))}
                {product.variations.length > 5 && <a href="#product-options">+ more</a>}
              </div>
            </div>
          )}

          <div className="product-actions">
            <a className="product-whatsapp-cta" href={getWhatsAppUrl(product)}>
              <WhatsAppIcon size={21} />
              Chat on WhatsApp to order
            </a>
            <a className="product-source-link" href={product.sourceUrl}>
              Original product URL
            </a>
          </div>

          <dl className="product-meta-list">
            <div>
              <dt>Colors</dt>
              <dd>{product.colors.length ? product.colors.join(", ") : "Custom Kente tones"}</dd>
            </div>
            <div>
              <dt>Availability</dt>
              <dd>{product.stockText || "Chat to confirm"}</dd>
            </div>
            <div>
              <dt>Ordering</dt>
              <dd>WhatsApp consultation, confirmation, and delivery coordination</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="product-seo-body" aria-labelledby="product-seo-heading">
        <div>
          <h2 id="product-seo-heading">Why buyers choose this {product.name}</h2>
          <p>{cleanStoreCopy(product.description || product.shortDescription || product.seo.description)}</p>
          <ul>
            {product.seo.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </div>

        <aside>
          <h3>Search Keywords</h3>
          <div className="product-keywords">
            {product.seo.keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </aside>
      </section>

      {product.variations.length > 0 && (
        <section className="product-options-section" id="product-options" aria-labelledby="product-options-title">
          <h2 id="product-options-title">Available options</h2>
          <div className="product-options-grid">
            {product.variations.slice(0, 12).map((variation) => (
              <article key={variation.id}>
                <h3>{variation.name}</h3>
                <p>{variation.option}</p>
                <span>
                  {currency === "ghana" && variation.priceGhs
                    ? `GH₵${variation.priceGhs.toLocaleString("en-US")}`
                    : variation.priceUsd
                      ? `$${variation.priceUsd.toLocaleString("en-US")}`
                      : "Chat for option price"}
                </span>
              </article>
            ))}
          </div>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="related-products-section" aria-labelledby="related-products-title">
          <h2 id="related-products-title">Related Kente designs</h2>
          <div className="store-grid related">
            {relatedProducts.map((item) => (
              <ProductCard product={item} currency={currency} key={item.id} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function BespokePage() {
  return (
    <main className="bespoke-page">
      <section className="bespoke-hero" aria-labelledby="bespoke-hero-title">
        <div className="bespoke-hero-copy">
          <p>Bespoke Kente</p>
          <h1 id="bespoke-hero-title">Crafted to match<br />your desire</h1>
          <span>
            With bespoke services, our skilled weavers craft the kente fabric to perfectly suit your desires.
            We practically listen to the client&apos;s preferences to weave the perfect piece. In this aspect,
            we then communicate and pick the best colors to fit the picture in the client&apos;s vision of the
            cloth and then we actualize that into reality for them.
          </span>
        </div>
        <div className="bespoke-hero-art" aria-hidden="true">
          <div className="bespoke-hero-gold" />
          <img src="/images/hinkro-bespoke-kente-shuttles.png" alt="" />
        </div>
      </section>

      <section className="bespoke-services" aria-label="Bespoke Kente services">
        {bespokeServiceRows.map((item, index) => (
          <article
            className={`bespoke-service-row ${index % 2 === 0 ? "is-image-first" : "is-text-first"}`}
            key={item.title}
          >
            <figure className="bespoke-service-image">
              <img src={item.image} alt={item.imageAlt} />
            </figure>
            <div className="bespoke-service-copy">
              <h2>{item.title}</h2>
              <p>{item.text}</p>
              {item.cta && (
                <a className="bespoke-service-cta" href="#store">
                  <span aria-hidden="true">▣</span> {item.cta}
                </a>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="bespoke-dreams" aria-labelledby="bespoke-dreams-title">
        <figure className="bespoke-dreams-image">
          <img src="/images/hinkro-bespoke-dreams-shapes-hues.jpg" alt="Curated yellow and grey Kente fabric with Hinkro packaging" />
        </figure>
        <div className="bespoke-dreams-copy">
          <h2 id="bespoke-dreams-title">Dreams into shapes<br />and hues</h2>
          <p>
            Inspiring Greatness. For over 5 years, Hinkro has pushed the boundaries of luxury,
            creating new realities both within and beyond fabric design. We hope to impact and touch
            lives through quality services to our loyal consumers
          </p>
          <a className="bespoke-dreams-cta" href="https://hinkrokente.com/appointment/">
            Book Appointment <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <BespokeFaqSection />
      <TrendsNewsSection />
    </main>
  );
}

function BespokeFaqSection() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section className="bespoke-faq-section" aria-labelledby="bespoke-faq-title">
      <h2 id="bespoke-faq-title" className="sr-only">Bespoke Kente frequently asked questions</h2>
      <div className="bespoke-faq-list">
        {bespokeFaqItems.map((item, index) => (
          <article className="bespoke-faq-item" key={item.question}>
            <button
              type="button"
              aria-expanded={openFaq === index}
              onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
            >
              <span>{item.question}</span>
              <span aria-hidden="true" className="bespoke-faq-icon">⌄</span>
            </button>
            <div className={openFaq === index ? "bespoke-faq-answer is-open" : "bespoke-faq-answer"}>
              <p>{item.answer}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DesignPage() {
  return (
    <main className="design-page">
      <section className="design-process-section" aria-labelledby="design-process-title">
        <div className="design-process-intro">
          <p>Our Design Process</p>
          <h1 id="design-process-title">Stages that results in success</h1>
          <span>
            This is where we put together the beautiful concept of designs in
            your mind to reality. We put the colors of your choice in this process.
          </span>
        </div>

        <div className="design-process-layout">
          <div className="design-process-column design-process-left">
            {designProcessSteps.slice(0, 3).map((step) => (
              <article className="design-step" key={step.number}>
                <div className="design-step-heading">
                  <strong>{step.number}</strong>
                  <h2>{step.title}</h2>
                </div>
                <p>{step.text}</p>
              </article>
            ))}
          </div>

          <div className="design-sketch-wrap" aria-hidden="true">
            <img
              src="/images/hinkro-kente-design-process-sketch.png"
              alt=""
            />
          </div>

          <div className="design-process-column design-process-right">
            {designProcessSteps.slice(3).map((step) => (
              <article className="design-step" key={step.number}>
                <div className="design-step-heading">
                  <strong>{step.number}</strong>
                  <h2>{step.title}</h2>
                </div>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <DesignOfferingsSection />
      <DesignStudioSection />
      <DesignTeamSection />
    </main>
  );
}

function DesignOfferingsSection() {
  return (
    <section className="design-offerings-section" aria-labelledby="design-offerings-title">
      <div className="design-offerings-divider" aria-hidden="true" />
      <h2 id="design-offerings-title">Design Offerings</h2>
      <img
        className="design-offerings-sketch design-offerings-sketch-left"
        src="/images/hinkro-kente-design-process-sketch.png"
        alt=""
        aria-hidden="true"
      />
      <img
        className="design-offerings-sketch design-offerings-sketch-right"
        src="/images/hinkro-kente-design-process-sketch.png"
        alt=""
        aria-hidden="true"
      />

      <div className="design-offerings-list">
        {designOfferings.map((offering, index) => (
          <article
            className={`design-offering ${index % 2 === 0 ? "is-image-first" : "is-text-first"}`}
            key={offering.title}
          >
            <figure className="design-offering-image">
              <img src={offering.image} alt={offering.imageAlt} />
            </figure>
            <div className="design-offering-copy">
              <h3>{offering.title}</h3>
              <p>{offering.text}</p>
              {offering.cta && (
                <a
                  href={offering.ctaHref || "#bespoke"}
                  className="design-offering-cta"
                >
                  Learn More <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DesignStudioSection() {
  return (
    <section className="design-studio-section" aria-labelledby="design-studio-title">
      <div className="design-studio-inner">
        <div className="design-studio-shuttle" aria-hidden="true">
          <img src="/images/hinkro-kente-shuttle-illustration.png" alt="" />
        </div>
        <h2 id="design-studio-title">Our studio</h2>
        <p>
          Here is where we transform the beautiful design concepts in your mind into reality.
          While our weaving studio is still under construction, our consultation office is open
          during working hours to assist you. Click here if you want to be notified once our
          Accra weaving studio is ready.
        </p>
      </div>

      <div className="design-studio-map" aria-label="Hinkro Kente location map">
        <iframe
          title="Hinkro Kente location map"
          src="https://www.google.com/maps?q=Hinkro%20Kente%201156%20Ubor%20Ntiador%20Lk%20Ablekuma%20Olebu%20Accra%20Ghana&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}

function DesignTeamSection() {
  return (
    <section className="design-team-section" aria-labelledby="design-team-title">
      <div className="design-team-inner">
        <figure className="design-team-photo">
          <img
            src="/images/hinkro-kente-eric-boafo-asante-ceo.jpg"
            alt="Eric Boafo Asante, CEO and Creative Director of Hinkro Kente"
          />
        </figure>

        <article className="design-team-copy">
          <h2 id="design-team-title">Our Team</h2>
          <h3>Eric Boafo Asante</h3>
          <p className="design-team-role">CEO / Creative Director</p>
          <p>
            Eric Boafo Asante noticed a lack of progress in locally made fabrics,
            especially in Ghanaian kente fabrics. To change this, he decided to
            modernize the kente fabric industry by mixing traditional methods with
            new designs. Eric wants to make a unique product that appeals to both
            local and international customers by blending the history of kente
            fabrics with modern styles. At Hinkro, Eric Boafo Asante is known for his
            dedication to creativity and excellence. His innovative strategies have
            helped the company become a leader in the textile industry, known for
            its high-quality products and original designs. Hinkro is now seen as a
            symbol of creativity and quality, setting new standards for craftsmanship
            and innovation in the world of Kente textiles.
          </p>
          <a className="design-team-cta" href="#team">
            View Team <span aria-hidden="true">→</span>
          </a>
        </article>
      </div>
    </section>
  );
}

function InspiringTradition() {
  return (
    <main className="tradition-page">
      <section
        className="tradition-intro"
        aria-labelledby="inspiring-tradition-title"
      >
        <div className="tradition-art left-art" aria-hidden="true">
          <img
            src="/images/inspiring-tradition-kente-weave-illustration.png"
            alt=""
          />
        </div>

        <article className="tradition-copy">
          <p className="section-kicker">About Us</p>
          <h1 id="inspiring-tradition-title">
            Hinkro Kente designs and hand-weaves bespoke kente textiles,
            crafted to each client&apos;s unique vision. We combine authentic
            Ghanaian weaving tradition with refined design to create
            one-of-a-kind luxury pieces for weddings, special events, and
            heritage celebrations.
          </h1>
          <p className="tradition-lead">
            We serve discerning brides, grooms, families, and cultural
            enthusiasts—in Ghana, Africa, and the diaspora—who want more than
            just fabric. Our clients value authenticity, artistry, and personal
            storytelling woven into every thread.
          </p>
          <p className="tradition-body">
            Because kente is more than clothing—it&apos;s identity, heritage,
            and pride. Every Hinkro piece preserves centuries-old artistry while
            expressing the modern elegance and individuality of its wearer. We
            make sure that when you step out in Hinkro Kente, you carry both
            your story and your culture with unmatched beauty and dignity.
          </p>
        </article>

        <div className="tradition-art right-art" aria-hidden="true">
          <img src="/images/inspiring-tradition-table-loom.svg" alt="" />
        </div>
      </section>

      <section
        className="tradition-exclusivity"
        aria-labelledby="tradition-exclusivity-title"
      >
        <div className="tradition-divider" aria-hidden="true" />
        <div className="tradition-exclusivity-copy">
          <h2 id="tradition-exclusivity-title">
            Committed to exclusivity.
          </h2>
          <p>
            Our goal is to advance the rich tradition of Kente weaving by
            integrating modern technology and design innovation, creating unique
            and high-quality patterns that meet the evolving tastes of
            contemporary fashion. Through our work, we aim to sustain cultural
            heritage, promote craftsmanship, and provide individuals with
            meaningful, personalized textiles that tell their stories.
          </p>
        </div>

        <button
          className="tradition-video-preview"
          type="button"
          aria-label="Play Hinkro Kente tradition video"
        >
          <img
            src="/images/inspiring-tradition-committed-exclusivity-video-preview.jpg"
            alt="Hinkro Kente bespoke Kente weaving story video preview"
          />
          <span className="play-button" aria-hidden="true">
            <Play size={34} fill="currentColor" strokeWidth={0} />
          </span>
        </button>

        <TraditionFeatureCarousel />
      </section>

      <ValueSection />
      <HistorySection />
      <ReviewsFaqSection />
      <TrendsNewsSection />
    </main>
  );
}


function FooterSocialIcon({ type }) {
  if (type === "instagram") {
    return (
      <svg className="footer-brand-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="4" y="4" width="16" height="16" rx="5" />
        <circle cx="12" cy="12" r="3.7" />
        <circle cx="17" cy="7" r="1" />
      </svg>
    );
  }

  if (type === "facebook") {
    return (
      <svg className="footer-brand-icon footer-brand-icon-fill" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M14.2 8.3h2.2V4.6c-.38-.05-1.68-.16-3.2-.16-3.16 0-5.32 1.93-5.32 5.47v3.08H4.4v4.12h3.48V24h4.28v-6.89h3.35l.53-4.12h-3.88v-2.67c0-1.19.33-2.02 2.04-2.02Z" />
      </svg>
    );
  }

  return (
    <svg className="footer-brand-icon footer-brand-icon-fill" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12.2 0C5.46 0 2 4.84 2 8.88c0 2.43.92 4.6 2.9 5.4.32.13.61 0 .7-.35.07-.24.22-.87.29-1.13.09-.35.05-.47-.2-.77-.57-.67-.94-1.54-.94-2.78 0-3.57 2.67-6.76 6.95-6.76 3.79 0 5.88 2.32 5.88 5.41 0 4.07-1.8 7.5-4.48 7.5-1.48 0-2.58-1.22-2.23-2.72.42-1.79 1.24-3.72 1.24-5.01 0-1.16-.62-2.12-1.9-2.12-1.51 0-2.72 1.56-2.72 3.65 0 1.33.45 2.23.45 2.23l-1.82 7.72c-.54 2.29-.08 5.1-.04 5.38.02.17.24.21.34.08.14-.18 1.98-2.46 2.6-4.73.18-.64 1.02-3.98 1.02-3.98.5.96 1.98 1.8 3.54 1.8 4.66 0 7.82-4.25 7.82-9.94C21.4 3.47 17.76 0 12.2 0Z" />
    </svg>
  );
}

function TrendsNewsSection() {
  return (
    <section className="trends-news-section" aria-labelledby="trends-news-title">
      <div className="trends-news-inner">
        <div className="trends-news-divider" aria-hidden="true" />
        <h2 id="trends-news-title">
          Learn exciting trends and news, get helpful inspiration, advice and
          resources here.
        </h2>

        <a className="trends-news-cta" href="#blog">
          Kente Trends and News
        </a>
      </div>

      <div className="trends-carousel" aria-label="Kente trends and news gallery">
        {trendsNewsImages.map((image, index) => (
          <figure
            className="trend-card"
            key={image.src}
            style={{ "--trend-delay": `${index * 90}ms` }}
          >
            <img src={image.src} alt={image.alt} />
            <div className="trend-card-overlay" aria-hidden="true" />
          </figure>
        ))}
      </div>
    </section>
  );
}

function PortalIcon() {
  return <UserRound size={17} strokeWidth={1.8} aria-hidden="true" />;
}

const footerSitemapLinks = [
  ["Home", "#home"],
  ["Inspiring Tradition", "#tradition"],
  ["Design", "#design"],
  ["Bespoke", "#bespoke"],
  ["Accessories", "#accessories"],
  ["Store", "#store"],
  ["Graduation Stoles", "#graduation"],
];

const footerPolicyLinks = [
  ["Privacy Policy", "https://www.hinkrokente.com/privacy-policy/"],
  ["Bespoke Service Terms", "https://www.hinkrokente.com/terms-and-conditions-bespoke-service/"],
  ["Lead Time & Rush Orders", "https://www.hinkrokente.com/lead-time-and-rush-orders/"],
  ["Refund Policy", "https://www.hinkrokente.com/terms-and-conditions-refund-policy/"],
  [
    "Sample Strip & Pattern Development",
    "https://www.hinkrokente.com/terms-and-conditions-sample-strip-policy-and-pattern-development/",
  ],
];

function SiteFooter() {
  return (
    <>
      <section className="shop-footer-cta" aria-labelledby="shop-footer-title">
        <h2 id="shop-footer-title">
          Visit our Kente Shop for our curated kente fabric just for you
        </h2>
        <a className="shop-footer-button" href="#store">
          Shop Now <span aria-hidden="true">→</span>
        </a>
      </section>

      <footer className="site-footer" aria-label="Website footer">
        <div className="footer-main">
          <section className="footer-sitemap" aria-labelledby="footer-sitemap-title">
            <p className="footer-eyebrow">Hinkro Kente</p>
            <h3 id="footer-sitemap-title">Sitemap</h3>
            <nav className="footer-sitemap-links" aria-label="Site pages">
              {footerSitemapLinks.map(([label, href]) => (
                <a href={href} key={href}>
                  {label}
                </a>
              ))}
            </nav>
            <a className="footer-portal-link" href="/portal">
              <PortalIcon />
              <span>Client &amp; team portal</span>
            </a>
          </section>

          <div className="footer-divider" aria-hidden="true" />

          <section className="footer-client-note" aria-labelledby="footer-client-care-title">
            <h3 id="footer-client-care-title">Client care notice</h3>
            <p>
              Hinkro Kente creates bespoke Kente fabrics, ready-to-wear designs,
              ceremonial pieces, graduation stoles, bridal accessories, and curated
              services for clients who value cultural meaning, careful finishing,
              and a clear consultation process.
            </p>
            <p>
              Before confirming a bespoke order, sample strip, rush request,
              ready-to-wear purchase, or delivery arrangement, clients are encouraged
              to review the policies below. These terms explain timelines, refund
              conditions, privacy practices, pattern development expectations, and
              the responsibilities that help every Hinkro Kente order move smoothly.
            </p>
          </section>

          <nav className="footer-policy-links" aria-label="Important Hinkro Kente policies">
            {footerPolicyLinks.map(([label, href]) => (
              <a href={href} key={href}>
                {label}
              </a>
            ))}
          </nav>

          <nav className="footer-socials" aria-label="Hinkro Kente social media">
            <a href="https://www.instagram.com/hinkrokente/" aria-label="Instagram">
              <FooterSocialIcon type="instagram" />
            </a>
            <a href="https://web.facebook.com/hinkro" aria-label="Facebook">
              <FooterSocialIcon type="facebook" />
            </a>
            <a href="https://www.pinterest.com/hinkrokente/" aria-label="Pinterest">
              <FooterSocialIcon type="pinterest" />
            </a>
          </nav>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            Copyright © Hinkro Kente 2026. All Rights Reserved.
          </p>

          <img
            className="footer-payments"
            src="/images/hinkro-kente-payment-options-paystack.svg"
            alt="Payment options including Mastercard, Visa, MTN MoMo, Apple Pay, and AirtelTigo Money"
          />
        </div>
      </footer>
    </>
  );
}

function ReviewsFaqSection() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section className="reviews-faq-section" aria-labelledby="reviews-faq-title">
      <div className="reviews-faq-divider" aria-hidden="true" />
      <h2 id="reviews-faq-title" className="sr-only">
        Reviews and Frequently Asked Questions
      </h2>

      <div className="reviews-faq-grid">
        <div className="reviews-column">
          <h3>Reviews</h3>
          <GoogleReviewsWidget />
        </div>

        <div className="faq-column">
          <h3>Frequently Asked Questions (FAQ)</h3>
          <div className="faq-list">
            {faqItems.map((item, index) => (
              <article className="faq-item" key={item.question}>
                <button
                  type="button"
                  aria-expanded={openFaq === index}
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                >
                  <span>{item.question}</span>
                  <span className="faq-icon" aria-hidden="true">⌄</span>
                </button>
                <div className={openFaq === index ? "faq-answer is-open" : "faq-answer"}>
                  <p>{item.answer}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function GoogleReviewsWidget() {
  const [activeReview, setActiveReview] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [placeSummary, setPlaceSummary] = useState(null);
  const [status, setStatus] = useState("idle");
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const placeId = import.meta.env.VITE_GOOGLE_PLACE_ID;
  const hasGoogleConfig = Boolean(apiKey && placeId);
  const visibleReviews = reviews.length ? reviews : fallbackReviewItems;
  const review = visibleReviews[activeReview % visibleReviews.length];

  useEffect(() => {
    if (!hasGoogleConfig) return;

    let cancelled = false;

    setStatus("loading");

    loadGoogleMapsScript(apiKey)
      .then((google) => {
        if (cancelled) return;

        const container = document.createElement("div");
        const service = new google.maps.places.PlacesService(container);

        service.getDetails(
          {
            placeId,
            fields: ["name", "rating", "user_ratings_total", "reviews", "url"],
          },
          (place, serviceStatus) => {
            if (cancelled) return;

            if (
              serviceStatus !== google.maps.places.PlacesServiceStatus.OK ||
              !place
            ) {
              setStatus("error");
              return;
            }

            const googleReviews = (place.reviews || []).map((item) => ({
              name: item.author_name,
              age: item.relative_time_description,
              rating: item.rating,
              text: item.text,
              photo: item.profile_photo_url,
            }));

            setPlaceSummary({
              name: place.name,
              rating: place.rating,
              total: place.user_ratings_total,
              url: place.url,
            });
            setReviews(googleReviews);
            setActiveReview(0);
            setStatus("ready");
          },
        );
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey, hasGoogleConfig, placeId]);

  const goToReview = (direction) => {
    setActiveReview((index) => {
      const nextIndex = index + direction;
      if (nextIndex < 0) return visibleReviews.length - 1;
      if (nextIndex >= visibleReviews.length) return 0;
      return nextIndex;
    });
  };

  return (
    <div
      className={`review-widget ${hasGoogleConfig ? "is-live" : "needs-config"}`}
      aria-live="polite"
    >
      <div className="review-source">
        <span className="google-mark">G</span>
        <span>
          {hasGoogleConfig
            ? status === "ready"
              ? "Live Google Reviews"
              : "Connecting Google Reviews"
            : "Google Reviews Widget"}
        </span>
      </div>

      {!hasGoogleConfig && (
        <p className="review-config-note">
          Add `VITE_GOOGLE_MAPS_API_KEY` and `VITE_GOOGLE_PLACE_ID` to connect
          this widget to Hinkro Kente’s Google Business reviews.
        </p>
      )}

      {hasGoogleConfig && status === "error" && (
        <p className="review-config-note">
          Google Reviews could not load. Please confirm the Maps JavaScript API,
          Places API, API key, and Place ID are active.
        </p>
      )}

      {placeSummary && (
        <a
          className="review-business-summary"
          href={placeSummary.url}
          target="_blank"
          rel="noreferrer"
        >
          <strong>{placeSummary.rating?.toFixed?.(1) || placeSummary.rating}</strong>
          <span>rating from {placeSummary.total} Google reviews</span>
        </a>
      )}

      <div className="review-avatar">
        {review.photo ? (
          <img src={review.photo} alt="" />
        ) : (
          <span>{review.name?.charAt(0) || "H"}</span>
        )}
        <strong>G</strong>
      </div>
      <h4>{review.name}</h4>
      <p className="review-age">{review.age}</p>
      <div className="review-stars" aria-label={`${review.rating || 5} star Google review`}>
        {"★".repeat(Math.round(review.rating || 5))}
        <span>✹</span>
      </div>
      <p className="review-text">{review.text}</p>
      <button
        className="review-arrow review-arrow-left"
        type="button"
        aria-label="Previous review"
        onClick={() => goToReview(-1)}
      >
        <ChevronLeft size={28} strokeWidth={2.2} />
      </button>
      <button
        className="review-arrow review-arrow-right"
        type="button"
        aria-label="Next review"
        onClick={() => goToReview(1)}
      >
        <ChevronRight size={28} strokeWidth={2.2} />
      </button>
    </div>
  );
}

function HistorySection() {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateHistory = () => {
      const section = sectionRef.current;

      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const travel = Math.max(rect.height - viewportHeight, 1);
      const nextProgress = Math.min(
        Math.max((viewportHeight * 0.34 - rect.top) / travel, 0),
        1,
      );

      setProgress(nextProgress);
      setActiveIndex(
        Math.min(
          historyItems.length - 1,
          Math.floor(nextProgress * historyItems.length),
        ),
      );
    };

    updateHistory();
    window.addEventListener("scroll", updateHistory, { passive: true });
    window.addEventListener("resize", updateHistory);

    return () => {
      window.removeEventListener("scroll", updateHistory);
      window.removeEventListener("resize", updateHistory);
    };
  }, []);

  return (
    <section
      className="history-section"
      ref={sectionRef}
      style={{ "--history-progress": progress }}
      aria-labelledby="history-title"
    >
      <div className="history-sticky">
        <h2 id="history-title">Our History</h2>

        <img
          className="history-tape"
          src="/images/inspiring-tradition-history-measuring-tape.png"
          alt=""
          aria-hidden="true"
        />

        <div className="history-timeline" aria-label="Hinkro Kente history timeline">
          <div className="history-line" aria-hidden="true" />
          <div className="history-line-progress" aria-hidden="true" />

          {historyItems.map((item, index) => (
            <article
              className={`history-item ${
                index === activeIndex ? "is-active" : ""
              } ${index < activeIndex ? "is-past" : ""}`}
              key={item.year}
            >
              <div className="history-year">{item.year}</div>
              <div className="history-star" aria-hidden="true">★</div>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValueSection() {
  return (
    <section className="value-section" aria-labelledby="value-title">
      <div className="value-divider" aria-hidden="true" />

      <div className="value-header">
        <div className="value-copy">
          <h2 id="value-title">How we add value</h2>
          <p>
            Kente cloth symbolizes prestige and heritage. At Hinkro Kente, we
            aim to preserve and enhance this tradition. Our custom weaving
            services provide high-quality, unique pieces fit for royalty.
          </p>
          <a className="value-cta" href="https://hinkrokente.com/appointment/">
            Bespoke Service <span aria-hidden="true">→</span>
          </a>
        </div>

        <img
          className="value-yarn"
          src="/images/inspiring-tradition-yarn-value-illustration.png"
          alt=""
          aria-hidden="true"
        />
      </div>

      <div className="value-cards" aria-label="Hinkro Kente service values">
        {valueCards.map((card) => (
          <article className="value-card" key={card.title}>
            <img src={card.image} alt={`${card.title} by Hinkro Kente`} />
            <div className="value-card-overlay">
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="value-divider value-divider-bottom" aria-hidden="true" />
    </section>
  );
}

function TraditionFeatureCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const visibleCount = 1;
  const pageCount = Math.ceil(traditionCarouselItems.length / visibleCount);
  const carouselLoopItems = [
    ...traditionCarouselItems,
    ...traditionCarouselItems,
  ];
  const activePage = Math.floor(
    (activeIndex % traditionCarouselItems.length) / visibleCount,
  );

  const moveCarousel = (pageIndex) => {
    setIsTransitioning(true);
    setActiveIndex(pageIndex * visibleCount);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIsTransitioning(true);
      setActiveIndex((index) => index + visibleCount);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  const handleTransitionEnd = () => {
    if (activeIndex < traditionCarouselItems.length) return;

    setIsTransitioning(false);
    setActiveIndex(activeIndex % traditionCarouselItems.length);
  };

  return (
    <div className="tradition-carousel" aria-label="Hinkro Kente values carousel">
      <div className="tradition-carousel-topline">
        <span>Our approach</span>
        <div className="tradition-carousel-pagination" aria-label="Carousel pages">
          {Array.from({ length: pageCount }).map((_, pageIndex) => (
            <button
              className={pageIndex === activePage ? "is-active" : ""}
              key={pageIndex}
              type="button"
              aria-label={`Show carousel page ${pageIndex + 1}`}
              onClick={() => moveCarousel(pageIndex)}
            />
          ))}
        </div>
      </div>

      <div className="tradition-carousel-viewport">
        <div
          className="tradition-carousel-track"
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translate3d(calc(${activeIndex} * var(--carousel-step) * -1), 0, 0)`,
            transition: isTransitioning
              ? "transform 1100ms cubic-bezier(0.22, 1, 0.36, 1)"
              : "none",
          }}
        >
          {carouselLoopItems.map((item, index) => (
            <article className="tradition-carousel-card" key={`${item.title}-${index}`}>
              <div className="tradition-carousel-image">
                <img src={item.image} alt={`${item.title} at Hinkro Kente`} />
              </div>
              <div className="tradition-carousel-copy">
                <h3>{item.title}</h3>
                <p>{traditionCarouselCopy}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 6200);

    return () => window.clearInterval(timer);
  }, []);

  const goToSlide = (direction) => {
    setActiveIndex((index) => {
      const nextIndex = index + direction;
      if (nextIndex < 0) return slides.length - 1;
      if (nextIndex >= slides.length) return 0;
      return nextIndex;
    });
  };

  return (
    <section
      className="hero"
      id="home"
      aria-label="Bespoke Kente Weaving Services by Hinkro Kente"
    >
      <h1 className="seo-title">
        Bespoke Kente Weaving Services | Hinkro Kente
      </h1>
      {slides.map((slide, index) => (
        <div
          className={`hero-bg ${activeIndex === index ? "is-active" : ""}`}
          key={slide.image}
          role="img"
          aria-label={slide.imageAlt}
          style={{ backgroundImage: `url(${slide.image})` }}
        />
      ))}
      <div className="hero-shade" />

      <button
        className="hero-arrow left"
        type="button"
        aria-label="Previous slide"
        onClick={() => goToSlide(-1)}
      >
        <ChevronLeft size={38} strokeWidth={1.4} />
      </button>

      <div className="hero-content" key={activeIndex}>
        <p>{activeSlide.text}</p>
        <a className="mobile-hero-cta" href="https://wa.link/yeqwcd">
          Start Your Kente Now
        </a>
      </div>

      <div className="hero-marquee" aria-hidden="true">
        <span>Bespoke Kente Weaving Services</span>
        <span>Bespoke Kente Weaving Services</span>
      </div>

      <button
        className="hero-arrow right"
        type="button"
        aria-label="Next slide"
        onClick={() => goToSlide(1)}
      >
        <ChevronRight size={38} strokeWidth={1.4} />
      </button>

      <div className="slide-dots" aria-label="Slide controls">
        {slides.map((slide, index) => (
          <button
            type="button"
            key={slide.image}
            className={activeIndex === index ? "is-active" : ""}
            aria-label={`Show slide ${index + 1}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </section>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState(getCurrentPage);
  const [productSlug, setProductSlug] = useState(getProductSlugFromLocation);

  useEffect(() => {
    const syncPage = () => {
      setCurrentPage(getCurrentPage());
      setProductSlug(getProductSlugFromLocation());
    };

    window.addEventListener("hashchange", syncPage);
    window.addEventListener("popstate", syncPage);
    syncPage();

    return () => {
      window.removeEventListener("hashchange", syncPage);
      window.removeEventListener("popstate", syncPage);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [currentPage, productSlug]);

  return (
    <>
      <Header currentPage={currentPage} />
      {currentPage === "tradition" ? (
        <InspiringTradition />
      ) : currentPage === "design" ? (
        <DesignPage />
      ) : currentPage === "bespoke" ? (
        <BespokePage />
      ) : currentPage === "accessories" ? (
        <AccessoriesPage />
      ) : currentPage === "graduation" ? (
        <GraduationStolePage />
      ) : currentPage === "store" ? (
        <StorePage productSlug={productSlug} />
      ) : currentPage === "blog" ? (
        <BlogPage />
      ) : (
        <Hero />
      )}
      {currentPage !== "home" && <SiteFooter />}
    </>
  );
}

// The management portal is a separate, lazy-loaded bundle. Public visitors
// never download it; the public site above stays untouched.
const PortalApp = React.lazy(() => import("./portal/index.tsx"));
const isPortal = window.location.pathname.startsWith("/portal");

createRoot(document.getElementById("root")).render(
  isPortal ? (
    <React.Suspense fallback={null}>
      <PortalApp />
    </React.Suspense>
  ) : (
    <App />
  ),
);
