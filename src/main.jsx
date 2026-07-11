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
  ["Inspiring Tradition", "/weaving-authentic-ghanaian-kente-fabric/", "tradition"],
  ["Design", "/design-kente/", "design"],
  ["Bespoke", "/customized-kente-weaving-services/", "bespoke"],
  ["Accessories", "/hinkro-kente-accessories/", "accessories"],
  ["Store", "/authentic-kente-fabric/", "store"],
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
    category: "Protection and Storage",
    title: "Bridal Garment Bag",
    image: "/images/hinkro-accessory-bridal-garment-bag.jpg",
    hoverImage: "/images/hinkro-accessory-gown-bag-product.jpg",
    imageAlt: "Hinkro bridal garment bag for Kente gown protection",
    text: "Your dream Kente gown deserves first class care. Designed to keep your gown safe, spotless, and ready for your big moment, it's the elegant companion every bride deserves.",
    availability: "Bridal Package Only",
    actions: [
      ["Start Bridal Bespoke", "/kente-bridal-package/"],
      ["Get Garment Bag", "/product/bridal-gown-bag/"],
    ],
  },
  {
    category: "Protection and Storage",
    title: "Men Duffel Bag",
    image: "/images/hinkro-accessory-men-duffel-bag.jpg",
    hoverImage: "/images/hinkro-accessory-men-duffel-bag-product.jpg",
    imageAlt: "Hinkro men's duffel bag for Kente cloth protection and storage",
    text: "Effortlessly stylish and designed for the modern man, the Hinkro Men's Duffle Bag combines easy-carry convenience with spacious storage and premium protection for your Kente cloth. Crafted for those who demand both comfort and style, it's the perfect companion for travel or everyday elegance.",
    availability: "All Male Kente",
    actions: [
      ["Start Men Bespoke", "https://wa.link/5sqlyv"],
      ["Get Duffel Bag", "/product/hinkro-men-duffel-bag/"],
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
      ["Start Bridal Bespoke", "/kente-bridal-package/"],
      ["Get Fan", "/product/hinkro-hand-held-bridal-fan/"],
    ],
  },
  {
    category: "Ceremonial",
    title: "Kente Graduation Stole & Sash",
    image: "/images/graduation-stole/kente-graduation-stole-custom-name-closeup.jpg",
    hoverImage: "/images/graduation-stole/kente-graduation-stole-personalized-name.jpg",
    imageAlt: "Personalized Kente graduation stole with embroidered name",
    text: "Celebrate your achievement with a custom Kente graduation stole — woven in your school colours with your name, program, crest, and class year. A ceremonial keepsake that photographs beautifully and carries the pride of your journey.",
    availability: "Graduation Season · Group Orders Welcome",
    actions: [
      ["View Graduation Stoles", "/authentic-african-kente-graduation-stole-sashe/"],
      ["Order on WhatsApp", "https://wa.me/233209707235"],
    ],
  },
  {
    category: "Fragrance",
    title: "Hinkro Moonlight Eau De Parfum 30ml",
    image: "/images/hinkro-accessory-moonlight-perfume.jpg",
    hoverImage: "/images/hinkro-accessory-moonlight-perfume-product.jpg",
    imageAlt: "Bride wearing Kente accessories and holding Hinkro Moonlight perfume",
    text: "Every bride deserves to smell as beautiful as she looks. A delicate blend of charm and allure, made for the bride who wants to leave a trace of magic. With every spritz, it wraps you in a soft, luxurious scent that lingers long after the 'I do.'",
    availability: "Coming Soon (Pre-Order Only)",
    actions: [["Coming Soon", "/hinkro-kente-accessories/"]],
  },
  {
    category: "Protection and Storage",
    title: "Flip Box",
    image: "/images/hinkro-accessory-flip-box.jpg",
    imageAlt: "Hinkro flip box packaging for gifting Kente",
    text: "It's the ideal packaging for gifting Kente in style. Because every timeless fabric deserves a box that speaks tradition and class. Designed for secure storage and stunning presentation.",
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
  return "";
}

function getBlogSlugFromLocation() {
  const path = window.location.pathname;
  const blogMatch = path.match(/^\/blog\/([^/]+)\/?$/);
  if (blogMatch) return blogMatch[1];
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

function usePageSeo(title, description, keywords = [], jsonLd = null) {
  useEffect(() => {
    const previousTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const previousDescription = metaDescription?.getAttribute("content") || "";
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const previousKeywords = metaKeywords?.getAttribute("content") || "";
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    const prevOgTitle = ogTitle?.getAttribute("content") || "";
    const prevOgDesc = ogDesc?.getAttribute("content") || "";
    const prevTwTitle = twTitle?.getAttribute("content") || "";
    const prevTwDesc = twDesc?.getAttribute("content") || "";

    document.title = title;
    if (metaDescription) metaDescription.setAttribute("content", description);
    if (metaKeywords) metaKeywords.setAttribute("content", keywords.join(", "));
    if (ogTitle) ogTitle.setAttribute("content", title);
    if (ogDesc) ogDesc.setAttribute("content", description);
    if (twTitle) twTitle.setAttribute("content", title);
    if (twDesc) twDesc.setAttribute("content", description);

    let scriptEl = null;
    if (jsonLd) {
      scriptEl = document.createElement("script");
      scriptEl.type = "application/ld+json";
      scriptEl.text = JSON.stringify(jsonLd);
      document.head.appendChild(scriptEl);
    }

    return () => {
      document.title = previousTitle;
      if (metaDescription) metaDescription.setAttribute("content", previousDescription);
      if (metaKeywords) metaKeywords.setAttribute("content", previousKeywords);
      if (ogTitle) ogTitle.setAttribute("content", prevOgTitle);
      if (ogDesc) ogDesc.setAttribute("content", prevOgDesc);
      if (twTitle) twTitle.setAttribute("content", prevTwTitle);
      if (twDesc) twDesc.setAttribute("content", prevTwDesc);
      if (scriptEl?.parentNode) scriptEl.parentNode.removeChild(scriptEl);
    };
  }, [description, jsonLd, keywords, title]);
}

function getCurrentPage() {
  const path = window.location.pathname;

  if (path === "/authentic-african-kente-graduation-stole-sashe/") return "graduation";
  if (path === "/authentic-kente-fabric/" || path.startsWith("/product/")) return "store";

  if (path.startsWith("/blog/")) return "blog";

  const wpPageRoutes = {
    "/weaving-authentic-ghanaian-kente-fabric/": "tradition",
    "/authentic-kente-cloth/": "tradition",
    "/kente-trends/": "tradition",
    "/design-kente/": "design",
    "/hinkro-kente-accessories/": "accessories",
    "/customized-kente-weaving-services/": "bespoke",
    "/customized-kente-services/": "coming-soon-customized",
    "/kente-bridal-package/": "coming-soon-bridal",
    "/weave-on-demand-kente/": "coming-soon-weave",
    "/boutique-kente-shop-online-buy/": "store",
    "/lead-time-and-rush-orders/": "lead-time",
    "/privacy-policy/": "privacy",
    "/terms-and-condition/": "terms",
    "/terms-and-conditions-bespoke-service/": "bespoke-terms",
    "/terms-and-conditions-sample-strip-policy-and-pattern-development/": "sample-strip",
    "/terms-and-conditions-refund-policy/": "refund",
    "/contact-hinkro-kente/": "contact",
    "/appointment/": "contact",
    "/thank-you/": "home",
  };
  if (wpPageRoutes[path]) return wpPageRoutes[path];

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
        {navItems.map(([label, url, page]) => (
          <a
            key={page}
            href={url}
            className={currentPage === page ? "is-active" : ""}
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="nav-actions">
        <a className="nav-cta" href="/appointment/">
          Your Kente Awaits
        </a>
        <a
          className="nav-portal"
          href="/portal"
          aria-label="Client and team portal"
          title="Client & team portal"
        >
          <PortalIcon />
        </a>
      </div>

      {!open && (
        <a
          className="nav-mobile-portal"
          href="/portal"
          aria-label="Client and team portal"
          title="Client & team portal"
        >
          <PortalIcon />
        </a>
      )}

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
              {navItems.map(([label, url, page]) => (
                <a
                  key={page}
                  href={url}
                  className={currentPage === page ? "is-active" : ""}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </a>
              ))}
            </nav>

            <a className="mobile-panel-cta" href="/appointment/">
              Start Your Kente Now
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
              <a href="https://www.facebook.com/hinkro/" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/hinkrokente/" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/hinkro-kente" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://www.pinterest.com/hinkrokente/" aria-label="Pinterest" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24 18.635 24 24.006 18.633 24.006 12.013 24.006 5.393 18.635.026 12.017.026V0z"/></svg>
              </a>
            </div>

            <p className="mobile-copyright">
              © Hinkro Kente 2026. All rights reserved.<br />
              Terms and Privacy. Built and managed by{" "}
              <a href="https://www.nitlimited.com/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)", textDecoration: "underline" }}>
                Nusite IT Consulting Limited
              </a>
            </p>
          </div>
        </div>
      )}
    </header>
  );
}

function AccessoriesPage() {
  usePageSeo(
    "Kente Accessories | Graduation Stoles, Duffel Bags, Bridal Fans | Hinkro Kente",
    "Explore Hinkro Kente accessories — custom Kente graduation stoles, men's duffel bags, bridal hand fans, garment bags, flip boxes, and Moonlight perfume. Bespoke accessories for every occasion.",
    [
      "kente accessories",
      "kente graduation stole",
      "kente duffel bag",
      "bridal kente fan",
      "kente garment bag",
      "Hinkro accessories",
      "kente gift box",
    ],
  );

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
          <a href="/appointment/">
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
    "Order an authentic Kente Graduation Stole or sash from Hinkro Kente. Custom African graduation stoles with names, school colors, crests, class year, symbols, and rush-order guidance. Handwoven in Ghana, shipped worldwide.",
    [
      "Kente Graduation Stole",
      "Kente Graduation Sash",
      "African Kente Graduation Stole",
      "custom graduation stole Ghana",
      "personalized Kente graduation sash",
      "Hinkro Kente graduation stole",
      "bespoke graduation stole",
      "authentic handwoven graduation stole",
      "Ghanaian graduation stole",
      "university graduation kente",
    ],
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Kente Graduation Stole and Sash",
      "description": "Authentic handwoven Kente Graduation Stole and sash by Hinkro Kente. Custom African graduation stoles with names, school colors, crests, class year, symbols, and personalized details.",
      "brand": {"@type": "Brand", "name": "Hinkro Kente"},
      "category": "Graduation Accessories",
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "seller": {"@type": "Organization", "@id": "https://www.hinkrokente.com/#organization"}
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5",
        "bestRating": "5",
        "reviewCount": "3"
      }
    }
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
        <div className="graduation-final-cta-actions">
          <a href={getGraduationOrderUrl()}>
            <WhatsAppIcon />
            Order Now
          </a>
        </div>
      </section>

      <section className="shop-footer-cta graduation-shop-cta" aria-labelledby="graduation-shop-title">
        <h2 id="graduation-shop-title">
          Visit our Kente Shop for our curated kente fabric just for your graduation
        </h2>
        <a className="shop-footer-button" href="#store">
          Shop Now <span aria-hidden="true">→</span>
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
      : "Authentic Kente Fabric Store | Buy Handwoven Ghana Kente by Color | Hinkro Kente",
    selectedProduct
      ? selectedProduct.seo.description
      : "Shop authentic Hinkro Kente fabrics by color, design, ceremony, and style. Browse handwoven Ghanaian Kente by color and occasion — gold, blue, green, red, ombre, and more. Chat on WhatsApp to order your preferred Kente cloth.",
    selectedProduct
      ? selectedProduct.seo.keywords
      : [
          "authentic Kente fabric",
          "buy Kente online",
          "Ghana Kente cloth",
          "handwoven Kente",
          "Hinkro Kente store",
          "buy African fabric online",
          "Kente by color",
          "gold Kente",
          "blue Kente",
          "ombre Kente",
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
          clear WhatsApp path to confirm the right weave before ordering. Every piece
          is authentic handwoven Kente from our trusted weaving studio in Ghana.
        </p>
        <p>
          Looking for bespoke Kente weaving services? Hinkro Kente is a trusted kente
          weaver in Ghana offering custom kente weaving services and personalized kente
          weaving services for weddings, engagements, graduations, and cultural celebrations.
          We ship worldwide to the USA, UK, Canada, Europe, and beyond.
        </p>
      </section>
    </main>
  );
}

function BlogPostDetail({ blogSlug }) {
  const posts = usePublicBlogPosts();
  const post = posts.find((p) => p.slug === blogSlug);

  usePageSeo(
    post ? `${post.title} | Hinkro Kente` : "Blog Post | Hinkro Kente",
    post?.excerpt || "Read this Hinkro Kente blog post about Kente trends, bespoke Kente styling, and Ghanaian cultural heritage.",
    post ? [post.title, "Hinkro Kente blog", "Kente trends"] : ["Hinkro Kente blog", "Kente trends"],
  );

  if (!post) {
    return (
      <main className="store-page blog-page" id="blog">
        <section className="store-hero" aria-labelledby="blog-title">
          <p className="store-kicker">Blog</p>
          <h1 id="blog-title">Post not found</h1>
          <p>This blog post may have been moved or is no longer available.</p>
          <a href="/blog/" className="cta-button" style={{ display: "inline-block", marginTop: "1.5rem" }}>Back to all stories</a>
        </section>
      </main>
    );
  }

  const publishDate = post.publish_at ? new Date(post.publish_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null;

  return (
    <main className="store-page blog-page" id="blog">
      <section className="store-hero" aria-labelledby="post-title">
        <p className="store-kicker">Trends & News</p>
        <a href="/blog/" style={{ fontSize: "0.875rem", color: "var(--gold)", marginBottom: "1rem", display: "inline-block" }}>← Back to all stories</a>
        <h1 id="post-title">{post.title}</h1>
        {publishDate && (
          <p style={{ opacity: 0.7, fontSize: "0.9rem", marginTop: "0.5rem" }}>Published {publishDate}</p>
        )}
      </section>

      {post.featured_image && (
        <section className="store-grid-section" style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1.5rem" }}>
          <img
            src={post.featured_image}
            alt={post.title}
            style={{ width: "100%", height: "auto", borderRadius: "12px", marginBottom: "2rem" }}
          />
        </section>
      )}

      <section className="store-grid-section" style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1.5rem 3rem" }}>
        {post.excerpt && (
          <p style={{ fontSize: "1.15rem", lineHeight: 1.7, color: "var(--text)", marginBottom: "1.5rem", fontStyle: "italic" }}>
            {post.excerpt}
          </p>
        )}
        {post.content ? (
          <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        ) : (
          <p>Full content for this post is being prepared. Please check back soon for the complete article.</p>
        )}
        <div style={{ marginTop: "3rem", textAlign: "center" }}>
          <a href="/blog/" className="cta-button">← Back to all stories</a>
        </div>
      </section>
    </main>
  );
}

function BlogPage({ blogSlug }) {
  const posts = usePublicBlogPosts();
  const [postsPerPage, setPostsPerPage] = useState(12);
  const [blogPage, setBlogPage] = useState(1);

  if (blogSlug) {
    return <BlogPostDetail blogSlug={blogSlug} />;
  }

  usePageSeo(
    "Kente Trends & News | Bespoke Kente Inspiration & Styling | Hinkro Kente",
    "Read Hinkro Kente trends, bespoke Kente styling inspiration, wedding guidance, graduation ideas, ceremony advice, and custom Kente news from Ghana's trusted kente weaver.",
    ["Kente trends", "Kente news", "Hinkro Kente blog", "Ghana Kente inspiration", "bespoke Kente styling", "wedding Kente ideas"],
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
            <a href={post.slug ? `/blog/${post.slug}/` : undefined} className="store-product-card" key={post.id} style={{ textDecoration: "none", color: "inherit" }}>
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
            </a>
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
  usePageSeo(
    "Bespoke Kente Weaving Services | Custom Kente Designer in Ghana | Hinkro Kente",
    "Hinkro Kente offers bespoke Kente weaving services — custom-designed, handwoven Kente for weddings, engagements, graduations, and cultural celebrations. Trusted kente weaver in Ghana with worldwide delivery.",
    [
      "bespoke kente weaving services",
      "custom kente weaving services",
      "personalized kente weaving services",
      "kente weaver in Ghana",
      "trusted kente weaver",
      "custom kente cloth",
      "bespoke kente designer",
      "Hinkro Kente bespoke",
    ],
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Bespoke Kente Weaving",
      "provider": {"@type": "Organization", "@id": "https://www.hinkrokente.com/#organization"},
      "description": "Hinkro Kente provides bespoke Kente weaving services including custom color-way selection, storytelling patterns, and personalized design. Every cloth is handwoven in Ghana.",
      "areaServed": [
        {"@type": "Country", "name": "Ghana"},
        {"@type": "Country", "name": "United States"},
        {"@type": "Country", "name": "United Kingdom"},
        {"@type": "Country", "name": "Canada"}
      ]
    }
  );

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
          <a className="bespoke-dreams-cta" href="/appointment/">
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
  usePageSeo(
    "Kente Design Process | Custom Kente Design & Weaving Stages | Hinkro Kente",
    "See how Hinkro Kente designs and weaves custom Kente — from consultation and concept to sample weaving and finishing. Our 6-stage design process ensures your bespoke Kente is perfect.",
    [
      "kente design process",
      "custom kente design",
      "how kente is made",
      "kente weaving stages",
      "Hinkro Kente design",
      "bespoke kente process",
    ],
  );

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
  usePageSeo(
    "About Hinkro Kente | Ghanaian Bespoke Kente Weaving Company | Our Story",
    "Hinkro Kente is a Ghanaian bespoke Kente weaving company specialising in designing and hand-weaving custom-made Kente for weddings, graduations, and cultural celebrations. Learn about our story, mission, and craftsmanship.",
    [
      "about Hinkro Kente",
      "Ghanaian kente weaving company",
      "bespoke kente Ghana",
      "kente weaving history",
      "Hinkro Kente story",
      "traditional kente weaver",
    ],
  );

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
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }

  if (type === "linkedin") {
    return (
      <svg className="footer-brand-icon footer-brand-icon-fill" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  }

  return (
    <svg className="footer-brand-icon footer-brand-icon-fill" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24 18.635 24 24.006 18.633 24.006 12.013 24.006 5.393 18.635.026 12.017.026V0z" />
    </svg>
  );
}

function TrendsNewsSection() {
  const allImages = [...trendsNewsImages, ...trendsNewsImages];

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
        <div className="trends-carousel-track">
          {allImages.map((image, index) => (
            <figure
              className="trend-card"
              key={`${image.src}-${index}`}
            >
              <img src={image.src} alt={image.alt} loading="lazy" />
              <div className="trend-card-overlay" aria-hidden="true" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function PortalIcon() {
  return <UserRound size={17} strokeWidth={1.8} aria-hidden="true" />;
}

const footerSitemapLinks = [
  ["Sitemap", "/sitemap.xml"],
];

const footerPolicyLinks = [
  ["Privacy Policy", "/privacy-policy/"],
  ["Terms & Conditions", "/terms-and-condition/"],
  ["Bespoke Service Terms", "/terms-and-conditions-bespoke-service/"],
  ["Lead Time & Rush Orders", "/lead-time-and-rush-orders/"],
  ["Refund Policy", "/terms-and-conditions-refund-policy/"],
  [
    "Sample Strip & Pattern Development",
    "/terms-and-conditions-sample-strip-policy-and-pattern-development/",
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
          <section className="footer-client-note" aria-labelledby="footer-client-care-title">
            <h3 id="footer-client-care-title">Client care notice</h3>
            <p>
              Hinkro Kente creates bespoke Kente fabrics, ready-to-wear designs, ceremonial pieces, graduation stoles, bridal accessories, and curated services for clients who value cultural meaning, careful finishing, and a clear consultation process.
              {"\n"}As a trusted kente weaver in Ghana, we serve clients worldwide with custom kente weaving services and personalized kente weaving services.
              {"\n"}Before confirming a bespoke order, sample strip, rush request, ready-to-wear purchase, or delivery arrangement, clients are encouraged to review the policies below.
              {"\n"}These terms explain timelines, refund conditions, privacy practices, pattern development expectations, and the responsibilities that help every Hinkro Kente order move smoothly.
            </p>
          </section>

          <div className="footer-divider" aria-hidden="true" />

          <nav className="footer-policy-links" aria-label="Important Hinkro Kente policies">
            {footerPolicyLinks.map(([label, href]) => (
              <a href={href} key={href}>
                {label}
              </a>
            ))}
          </nav>

          <nav className="footer-socials" aria-label="Hinkro Kente social media">
            <a href="https://www.facebook.com/hinkro/" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <FooterSocialIcon type="facebook" />
            </a>
            <a href="https://www.instagram.com/hinkrokente/" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <FooterSocialIcon type="instagram" />
            </a>
            <a href="https://www.linkedin.com/company/hinkro-kente" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
              <FooterSocialIcon type="linkedin" />
            </a>
            <a href="https://www.pinterest.com/hinkrokente/" aria-label="Pinterest" target="_blank" rel="noopener noreferrer">
              <FooterSocialIcon type="pinterest" />
            </a>
          </nav>

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
          <a className="value-cta" href="/appointment/">
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
        Bespoke Kente Weaving Services | Custom Kente Weaver in Ghana | Hinkro Kente
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
        <span>Custom Kente Weaving Services</span>
        <span>Personalized Kente Weaving Services</span>
        <span>Trusted Kente Weaver in Ghana</span>
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

const policyPages = {
  "terms-and-condition": {
    title: "Terms and Conditions",
    subtitle: "Last modified 7 July 2024",
    seo: ["Hinkro Kente terms and conditions", "Hinkro Kente terms of service", "kente purchasing terms Ghana"],
    content: `
      <h2>Overview</h2>
      <p>This website is operated by Hinkro Kente. Throughout the site, the terms "we", "us" and "our" refer to Hinkro Kente. Hinkro Kente offers this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here. By visiting our site and/or purchasing something from us, you engage in our "Service" and agree to be bound by the following terms and conditions ("Terms of Service", "Terms"), including those additional terms and conditions and policies referenced herein and/or available by hyperlink. These Terms of Service apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.</p>
      <p>Please read these Terms of Service carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services.</p>

      <h2>Section 1 — Online Terms and Conditions</h2>
      <p>By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, and you have given us your consent to allow any of your minor dependents to use this site. You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws). You must not transmit any worms or viruses or any code of a destructive nature. A breach or violation of any of the Terms will result in an immediate termination of your Services.</p>

      <h2>Section 2 — General Conditions</h2>
      <p>We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks.</p>
      <p>You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service or any contact on the website through which the service is provided, without express written permission by us.</p>

      <h2>Section 3 — Accuracy, Completeness and Timeliness of Information</h2>
      <p>We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete or more timely sources of information. Any reliance on the material on this site is at your own risk.</p>
      <p>This site may contain certain historical information. Historical information, necessarily, is not current and is provided for your reference only. We reserve the right to modify the contents of this site at any time, but we have no obligation to update any information on our site.</p>

      <h2>Section 4 — Modifications to the Service and Prices</h2>
      <p>Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.</p>

      <h2>Section 5 — Products or Services</h2>
      <p>Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our <a href="/terms-and-conditions-refund-policy/">Refund Policy</a>. We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.</p>
      <p>We reserve the right, but are not obligated, to limit the sales of our products or Services to any person, geographic region or jurisdiction. We may exercise this right on a case-by-case basis. We reserve the right to limit the quantities of any products or services that we offer.</p>

      <h2>Section 6 — Accuracy of Billing and Account Information</h2>
      <p>We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. You agree to provide current, complete and accurate purchase and account information for all purchases made at our store. For more detail, please review our <a href="/terms-and-conditions-refund-policy/">Refund Policy</a>.</p>

      <h2>Section 7 — Optional Tools</h2>
      <p>We may provide you with access to third-party tools over which we neither monitor nor have any control nor input. You acknowledge and agree that we provide access to such tools "as is" and "as available" without any warranties, representations or conditions of any kind and without any endorsement. We shall have no liability whatsoever arising from or relating to your use of optional third-party tools.</p>

      <h2>Section 8 — Third-Party Links</h2>
      <p>Certain content, products and services available via our Service may include materials from third-parties. Third-party links on this site may direct you to third-party websites that are not affiliated with us. We are not responsible for examining or evaluating the content or accuracy and we do not warrant and will not have any liability or responsibility for any third-party materials or websites.</p>

      <h2>Section 9 — User Comments, Feedback and Other Submissions</h2>
      <p>If, at our request, you send certain specific submissions or without a request from us you send creative ideas, suggestions, proposals, plans, or other materials, whether online, by email, by postal mail, or otherwise (collectively, 'comments'), you agree that we may, at any time, without restriction, edit, copy, publish, distribute, translate and otherwise use in any medium any comments that you forward to us.</p>

      <h2>Section 10 — Personal Information</h2>
      <p>Your submission of personal information through the store is governed by our <a href="/privacy-policy/">Privacy Policy</a>.</p>

      <h2>Section 11 — Errors, Inaccuracies and Omissions</h2>
      <p>Occasionally there may be information on our site or in the Service that contains typographical errors, inaccuracies or omissions that may relate to product descriptions, pricing, promotions, offers, product shipping charges, transit times and availability. We reserve the right to correct any errors, inaccuracies or omissions, and to change or update information or cancel orders if any information in the Service or on any related website is inaccurate at any time without prior notice.</p>

      <h2>Section 12 — Prohibited Uses</h2>
      <p>In addition to other prohibitions as set forth in the Terms of Service, you are prohibited from using the site or its content: (a) for any unlawful purpose; (b) to solicit others to perform or participate in any unlawful acts; (c) to violate any international, federal, provincial or state regulations, rules, laws, or local ordinances; (d) to infringe upon or violate our intellectual property rights or the intellectual property rights of others; (e) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate; (f) to submit false or misleading information; (g) to upload or transmit viruses or any other type of malicious code; (h) to collect or track the personal information of others; (i) to spam, phish, pharm, pretext, spider, crawl, or scrape; (j) for any obscene or immoral purpose; or (k) to interfere with or circumvent the security features of the Service.</p>

      <h2>Section 13 — Disclaimer of Warranties; Limitation of Liability</h2>
      <p>We do not guarantee, represent or warrant that your use of our service will be uninterrupted, timely, secure or error-free. We do not warrant that the results that may be obtained from the use of the service will be accurate or reliable. You agree that from time to time we may remove the service for indefinite periods of time or cancel the service at any time, without notice to you.</p>
      <p>You expressly agree that your use of, or inability to use, the service is at your sole risk. The service and all products and services delivered to you through the service are (except as expressly stated by us) provided 'as is' and 'as available' for your use, without any representation, warranties or conditions of any kind, either express or implied.</p>
      <p>In no case shall Hinkro Kente, our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind.</p>

      <h2>Section 14 — Indemnification</h2>
      <p>You agree to indemnify, defend and hold harmless Hinkro Kente and our parent, subsidiaries, affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, interns and employees, harmless from any claim or demand, including reasonable attorneys' fees, made by any third-party due to or arising out of your breach of these Terms of Service or the documents they incorporate by reference, or your violation of any law or the rights of a third-party.</p>

      <h2>Section 15 — Severability</h2>
      <p>In the event that any provision of these Terms of Service is determined to be unlawful, void or unenforceable, such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall be deemed to be severed from these Terms of Service.</p>

      <h2>Section 16 — Termination</h2>
      <p>The obligations and liabilities of the parties incurred prior to the termination date shall survive the termination of this agreement for all purposes. These Terms of Service are effective unless and until terminated by either you or us.</p>

      <h2>Section 17 — Entire Agreement</h2>
      <p>The failure of us to exercise or enforce any right or provision of these Terms of Service shall not constitute a waiver of such right or provision. These Terms of Service and any policies or operating rules posted by us on this site constitute the entire agreement and understanding between you and us.</p>

      <h2>Section 18 — Governing Law</h2>
      <p>These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of the Republic of Ghana.</p>

      <h2>Section 19 — Return and Refund Policy</h2>
      <p>Any fabric you buy or order at Hinkro Kente comes with no warranty. We do not offer full refund after purchase is completed. We offer hassle-free and easy returns for all domestic and international orders. Please contact our Customer Support Team at <a href="mailto:ask@hinkrokente.com">ask@hinkrokente.com</a> to schedule your return.</p>
      <p>If there is a problem with your fabric or your fabric turned out to be different from what was discussed during initial conversations to the final approval, you can return it within a week of purchase. The shipping cost is on us if the return or exchange is caused by a production fault. After this period has elapsed the return postage has to be covered by the customer if it is not a production fault. See our full <a href="/terms-and-conditions-refund-policy/">Refund Policy</a>.</p>

      <h2>Section 20 — Changes to Terms of Service</h2>
      <p>You can review the most current version of the Terms of Service at any time at this page. We reserve the right to update, change or replace any part of these Terms of Service by posting updates and changes to our website. Your continued use of or access to our website following the posting of any changes constitutes acceptance of those changes.</p>

      <h2>Section 21 — Contact Information</h2>
      <p>Questions about the Terms of Service should be sent to us at <a href="mailto:ask@hinkrokente.com">ask@hinkrokente.com</a> or via our <a href="/contact-hinkro-kente/">contact form</a>.</p>
    `,
  },

  "bespoke-service-terms": {
    title: "Terms and Conditions",
    subtitle: "Bespoke Service",
    seo: ["Hinkro Kente bespoke service terms", "custom kente terms and conditions", "bespoke kente service agreement"],
    content: `
      <p>Hinkro Kente is a Ghanaian private company specializing in weaving custom-made kente cloth. Established and operating under the laws of the Republic of Ghana, our head office is located at Ablekuma L156 Ubor Ntiador LK GPS GC-124-4250 Accra-Ghana. We are represented internationally through offices in Riverdale, Georgia, USA (2837 Toapz RD) and Leicester, UK (4 Bedale Drive LE4 2LA).</p>

      <h2>Pre-Weaving Consultation</h2>
      <p>We begin each custom kente project with a <strong>Pre-Weaving Consultation</strong>, which is a separate service from the main weaving process. Clients are advised to consult our sales representatives for the accurate cost of the Pre-Weaving Consultation, as prices may vary depending on the specific services requested.</p>
      <p>The Pre-Weaving Consultation may include any or all of the following:</p>
      <ul>
        <li>Initial consultations</li>
        <li>Sketches</li>
        <li>Pattern development</li>
        <li>3D renders</li>
        <li>One (1) sample production</li>
      </ul>
      <p><strong>Please note:</strong></p>
      <ul>
        <li>The cost of the Pre-Weaving Consultation is billed separately and is not included in the final weaving cost.</li>
        <li>If the client requests additional samples beyond the first one provided (and the need for additional samples is not due to an error on Hinkro Kente's part), an additional fee shall apply. See our <a href="/terms-and-conditions-sample-strip-policy-and-pattern-development/">Sample Strip Policy</a>.</li>
        <li>Once the final sample is approved, a final cost will be determined and communicated for the production of the full number of sets requested.</li>
      </ul>

      <h2>Definition of Bespoke Orders</h2>
      <p>An order shall be classified as <strong>bespoke</strong> and must undergo the Pre-Weaving Consultation process under any of the following circumstances:</p>
      <ul>
        <li><strong>Custom Design Requests:</strong> The client requests a new or modified kente pattern that does not exist in our catalog. The design is inspired by unique themes, visuals, or concepts supplied by the client.</li>
        <li><strong>Personalized Elements:</strong> The order involves inclusion of names, initials, logos, dates, or other personalized text or symbols.</li>
        <li><strong>Color Customization:</strong> The client specifies custom colors that differ from our existing palette.</li>
        <li><strong>3D Renders or Sample Requests:</strong> The client requests visual previews or physical samples before final production.</li>
        <li><strong>Corporate or Institutional Branding:</strong> The project involves company logos, branded colors, slogans, or identity features for organizational or promotional use.</li>
      </ul>

      <h2>Lead Time</h2>
      <p>To ensure a high-quality finished product, we recommend a minimum of 3 months lead time for kente weaving projects. Rush orders requiring a shorter turnaround may be accommodated for an additional fee. <a href="/lead-time-and-rush-orders/">Learn more about lead times and rush orders</a>.</p>

      <h2>Project Timeline</h2>
      <p>The weaving process typically takes 4–6 weeks, depending on several factors, including:</p>
      <ul>
        <li>Kente style (e.g., ombre, kente with embroidery, etc.)</li>
        <li>Fabric yardage</li>
        <li>Design complexity</li>
      </ul>
      <p>Hinkro Kente will provide a precise estimated completion date for each project.</p>

      <h2>Environmental Considerations</h2>
      <p>Kente weaving is traditionally an outdoor activity. Unforeseen weather events such as excessive rainfall, severe harmattan winds, or outbreaks of disease may occasionally impact project timelines. We will promptly communicate any such delays to our clients.</p>

      <h2>Design Collaboration</h2>
      <ul>
        <li>During the consultation process, Hinkro Kente will collaborate with you to develop a digital rendering of your desired kente design, ensuring it meets your vision.</li>
        <li>We will send you images of yarn options that align with your preferences. Upon approval, weaving commences immediately.</li>
        <li>Throughout the weaving process, we will provide you with regular updates, including photos, for your confirmation before we proceed further.</li>
        <li>To avoid any color discrepancies, we encourage prompt feedback on yarn selections.</li>
      </ul>

      <h2>Payment and Delivery</h2>
      <ul>
        <li><strong>Payment Methods:</strong> We accept cash, bank transfers, and mobile money payments for our services. A 1% electronic transaction levy (E-levy) may apply to electronic payments.</li>
        <li><strong>Payment Schedule:</strong> A 70% down payment is required to initiate your project. The remaining 30% balance is due upon project completion before delivery.</li>
      </ul>

      <h2>Refund Policy</h2>
      <p>Due to the personalized and handcrafted nature of Hinkro Kente's bespoke services, refunds are generally not available once work has commenced. However, we are committed to client satisfaction and will offer reasonable solutions for issues that arise, including revisions and credits, where applicable. See our full <a href="/terms-and-conditions-refund-policy/">Refund Policy</a>.</p>

      <h2>Confidentiality</h2>
      <p>Both parties agree to maintain the confidentiality of all information related to this agreement and each other's business practices.</p>

      <h2>Contract Termination</h2>
      <p>This agreement may be terminated by either party under the following conditions:</p>
      <ul>
        <li><strong>With Notice:</strong> Written or text message notification must be provided at least one day prior to the commencement of weaving.</li>
        <li><strong>Breach of Contract:</strong> If either party breaches the terms of this agreement and fails to remedy the breach within one day of written notification, the other party may terminate the agreement.</li>
        <li><strong>Termination by Client:</strong> Clients who wish to terminate the contract after 90% project completion (approximately 4 weeks of weaving) will forfeit their entire investment with no refund.</li>
        <li><strong>Termination by Hinkro Kente:</strong> In the unlikely event that Hinkro Kente needs to terminate the contract after 90% project completion, a full refund will be issued to the client.</li>
        <li><strong>Termination Rights:</strong> Termination of this agreement will not affect any outstanding legal rights related to payments or services rendered prior to termination.</li>
      </ul>

      <h2>Dispute Resolution</h2>
      <p>Any disputes arising from this agreement will be settled amicably through negotiation. If an amicable resolution cannot be reached, the dispute will be settled by arbitration in accordance with the Alternative Dispute Resolution Act, 2010 (Act 798) or its statutory replacement.</p>

      <h2>Governing Law</h2>
      <p>This agreement is subject to the laws of the Republic of Ghana.</p>
    `,
  },

  "lead-time-and-rush-orders": {
    title: "Terms and Conditions",
    subtitle: "Lead Time and Rush Orders",
    seo: ["Hinkro Kente lead time", "kente rush order", "kente weaving timeline Ghana"],
    content: `
      <p>At Hinkro Kente, our weaving process is rooted in precision, craftsmanship, and attention to detail. To ensure the delivery of a high-quality and truly bespoke product, we recommend a <strong>minimum lead time of three (3) months</strong> for all kente weaving projects. This timeframe allows for proper consultation, design development, sample weaving, client feedback, revisions (if necessary), and full production.</p>

      <h2>Why 3 Months?</h2>
      <ul>
        <li><strong>Consultation & Design</strong> – Time to understand the client's vision and translate it into a workable pattern.</li>
        <li><strong>Sample Strip Creation</strong> – Allowing for creation and approval of initial samples. See our <a href="/terms-and-conditions-sample-strip-policy-and-pattern-development/">Sample Strip Policy</a>.</li>
        <li><strong>Pattern Iteration (if needed)</strong> – Especially for new or complex designs, multiple sample attempts may be necessary.</li>
        <li><strong>Weaving & Finishing</strong> – Meticulous weaving, finishing, and quality control require time to maintain our high standards.</li>
      </ul>

      <h2>Rush Orders</h2>
      <p>We understand that some clients may have tighter deadlines due to events or unforeseen changes. In such cases, <strong>rush orders may be accommodated</strong> under the following conditions:</p>
      <ul>
        <li><strong>Rush Fee:</strong> A rush handling fee will apply to prioritize your order ahead of others and account for overtime or resource allocation.</li>
        <li><strong>Design Restrictions:</strong> For extremely tight deadlines, complex new patterns may not be possible. Clients may be limited to choosing from existing or slightly modified designs to meet the time constraint.</li>
        <li><strong>Availability Confirmation:</strong> Rush orders are subject to availability and capacity. We will assess whether we can take on the project without compromising quality.</li>
        <li><strong>Written Agreement:</strong> All rush orders will require a written agreement detailing the revised timeline, design scope, associated costs, and delivery expectations.</li>
      </ul>

      <h2>Client Responsibility for Shorter Timelines</h2>
      <p>Clients requesting turnaround times shorter than the recommended 3-month lead time are responsible for:</p>
      <ul>
        <li>Prompt communication and approval at each stage of the process.</li>
        <li>Accepting potential limitations in design customization due to time constraints.</li>
        <li>Covering any additional rush-related fees as outlined in the order agreement.</li>
      </ul>
      <p>By maintaining these lead time standards and offering structured options for rush orders, we ensure that every client receives a product that meets Hinkro Kente's hallmark of excellence—whether planned well in advance or needed on a shorter timeline.</p>
    `,
  },

  "refund-policy": {
    title: "Terms and Conditions",
    subtitle: "Refund Policy",
    seo: ["Hinkro Kente refund policy", "kente return policy", "bespoke kente refund"],
    content: `
      <p>At Hinkro Kente, each bespoke order is a custom, made-to-measure creation that involves significant design consultation, preparation, and hand-weaving. As such, we take the following approach to refunds:</p>

      <h2>1. Non-Refundable Deposits</h2>
      <ul>
        <li>All bespoke orders require a <strong>non-refundable deposit</strong> to initiate work. This covers initial consultation, pattern development, and the cost of sample strip weaving.</li>
        <li>The deposit amount and terms will be outlined in the service agreement or invoice.</li>
      </ul>

      <h2>2. Refund Eligibility</h2>
      <p>Refunds are <strong>not guaranteed</strong> but may be considered under the following limited circumstances:</p>
      <p><strong>Project Cancellation Before Weaving Begins:</strong></p>
      <ul>
        <li>If a client cancels before any weaving has started, and only consultation/design work has occurred, a partial refund may be issued excluding the deposit and any material costs incurred up to that point.</li>
      </ul>
      <p><strong>Defects in Final Product:</strong></p>
      <ul>
        <li>If the final product arrives with significant, demonstrable defects (e.g., damage during delivery, major deviation from approved design), we will review the claim and may offer a partial or full refund, reproduce the item at no cost, or provide a store credit.</li>
        <li>All claims must be submitted within 7 days of receipt, with clear photo evidence.</li>
      </ul>

      <h2>3. No Refunds Under These Conditions</h2>
      <p>Refunds will <strong>not</strong> be issued under the following circumstances:</p>
      <ul>
        <li>Change of mind after order confirmation</li>
        <li>Delay caused by late client approvals, feedback, or payments</li>
        <li>Dissatisfaction with a design that was previously approved</li>
        <li>Minor variations due to the handmade nature of weaving</li>
      </ul>

      <h2>4. Rush Orders</h2>
      <p>All <strong>rush orders are non-refundable</strong> due to the accelerated timeline, limited revision opportunities, and reallocation of resources.</p>

      <h2>5. Client Collaboration Requirement</h2>
      <p>To ensure quality outcomes, clients are expected to:</p>
      <ul>
        <li>Respond promptly to consultation communications and approvals</li>
        <li>Clearly express their expectations and desired changes at each step</li>
      </ul>
      <p>Failure to participate in the collaborative process may limit eligibility for refunds or revisions.</p>

      <h2>6. Dispute Resolution</h2>
      <p>In the event of a disagreement, Hinkro Kente will work in good faith to resolve the issue, which may include offering a revision or partial store credit, or mediation through an independent third party if agreed upon.</p>
    `,
  },

  "sample-strip-policy": {
    title: "Terms and Conditions",
    subtitle: "Sample Strip Policy and Pattern Development",
    seo: ["Hinkro Kente sample strip policy", "kente pattern development", "kente sample strip cost"],
    content: `
      <h2>Sample Strip Provision</h2>
      <p>As part of our bespoke service, Hinkro Kente provides one (1) complimentary sample strip during the Pre-Weaving Consultation phase. This initial sample aims to align the client's vision with our weaving capabilities.</p>

      <h2>Additional Sample Strips</h2>
      <p>Should the client request further sample strips beyond the initial complimentary one, additional charges will apply. The cost for each extra sample strip will be communicated and agreed upon before production.</p>

      <h2>Modifications to Existing Patterns</h2>
      <p>Clients may request modifications to existing patterns, such as adding or altering motifs. Such customizations will incur additional fees, which will be determined based on the complexity of the changes and communicated to the client beforehand.</p>

      <h2>Development of New Patterns</h2>
      <p>Creating entirely new kente patterns is an intricate process that may require multiple iterations to achieve the desired outcome. Clients should be aware that:</p>
      <ul>
        <li>The initial development fee covers the design and weaving of the first sample strip.</li>
        <li>If subsequent iterations are necessary to refine the pattern, each additional sample strip will incur a separate fee.</li>
        <li>The number of iterations required cannot always be predetermined, as achieving the perfect design is a collaborative and creative process.</li>
      </ul>

      <h2>Client Responsibility</h2>
      <p>Clients are responsible for the costs associated with each additional sample strip requested beyond the initial complimentary one. Hinkro Kente commits to working closely with clients throughout the design process to ensure satisfaction with the final product.</p>
      <p>Go to main <a href="/terms-and-conditions-bespoke-service/">T&C (Bespoke Service)</a></p>
    `,
  },

  "privacy-policy": {
    title: "Privacy Policy",
    subtitle: "How we collect and use your data",
    seo: ["Hinkro Kente privacy policy", "kente website privacy", "Hinkro Kente data policy"],
    content: `
      <h2>1. Introduction</h2>
      <p>This Policy is designed to assist you in understanding how we collect, use and safeguard the personal information you provide to us and to assist you in making informed decisions when using our site and our products and services. This statement will be continuously assessed against new technologies, business practices and our customers' needs.</p>

      <h2>2. What Information Do We Collect?</h2>
      <p>When you visit our website you may provide us with two types of information: personal information you knowingly choose to disclose that is collected on an individual basis and website use information collected on an aggregate basis as you and others browse our website.</p>
      <p><strong>Personal Information You Choose to Provide:</strong> Name, email address, phone number. In addition to providing the foregoing information, if you choose to correspond further with us through chatbot, we may retain the content of your chat messages together with your phone number and our responses.</p>
      <p><strong>Website Use Information:</strong> Similar to other commercial websites, our website utilizes a standard technology called "cookies" and web server logs to collect information about how our website is used. Information gathered through cookies and web server logs may include the date and time of visits, the pages viewed, time spent at our website, and the websites visited just before and just after our website. This information is collected on an aggregate basis. None of this information is associated with you as an individual. We do not store credit card details nor do we share customer details with any third parties.</p>

      <h2>3. How Do We Use the Information That You Provide to Us?</h2>
      <p>Broadly speaking, we use personal information for purposes of administering our business activities, providing customer service and making available other products and services to our customers and prospective customers. Occasionally, we may also use the information we collect to notify you about new services and special offers we think you will find valuable.</p>

      <h2>What Are Cookies?</h2>
      <p>Cookies are a feature of web browser software that allows web servers to recognize the computer used to access a website. Cookies are small pieces of data that are stored by a user's web browser on the user's hard drive. Cookies can remember what information a user accesses on one web page to simplify subsequent interactions with that website by the same user or to use the information to streamline the user's transactions on related web pages.</p>

      <h2>4. How Do We Use Information We Collect from Cookies?</h2>
      <p>We use website browser software tools such as cookies and web server logs to gather information about our website users' browsing activities, in order to constantly improve our website and better serve our customers. This information assists us to design and arrange our web pages in the most user-friendly manner and to continually improve our website to better meet the needs of our customers and prospective customers.</p>

      <h2>5. How Do We Protect Your Information?</h2>
      <p>We utilize encryption/security best practices to safeguard the confidentiality of personal information we collect from unauthorized access or disclosure and accidental loss, alteration or destruction.</p>
      <p><strong>Communication Opt Out:</strong> If you wish to opt out of receiving offers directly from Hinkro Kente, you can unsubscribe by following the opt-out instructions in the emails that they send you located at the footer of the communication. You can email us at <a href="mailto:ask@hinkrokente.com">ask@hinkrokente.com</a> with questions, comments, or suggestions.</p>

      <h2>6. Do We Disclose Information to Outside Parties?</h2>
      <p>When you leave comments on the website we collect the data shown in the comments form, and also the IP address and browser user agent string to help spam detection. We may provide aggregate information about our customers, sales, website traffic patterns and related website information to our affiliates or reputable third parties, but this information will not include personally identifying data, except as otherwise provided in this Privacy Policy.</p>

      <h2>7. Legally Compelled Disclosure of Information</h2>
      <p>We may disclose information when legally compelled to do so, in other words, when we, in good faith, believe that the law requires it or for the protection of our legal rights.</p>

      <h2>What About Other Websites Linked to Our Website?</h2>
      <p>We are not responsible for the practices employed by websites linked to or from our website nor the information or content contained therein.</p>
    `,
  },
};

function PolicyPage({ slug }) {
  const page = policyPages[slug];
  if (!page) return <Hero />;

  usePageSeo(
    `${page.title} — ${page.subtitle} | Hinkro Kente`,
    page.content.replace(/<[^>]+>/g, "").slice(0, 160) + "...",
    page.seo,
  );

  return (
    <main className="store-page policy-page" id={slug}>
      <section className="store-hero" aria-labelledby="policy-title">
        <p className="store-kicker">{page.subtitle}</p>
        <h1 id="policy-title">{page.title}</h1>
      </section>
      <section className="store-grid-section" style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1.5rem 3rem" }}>
        <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: page.content }} />
      </section>
    </main>
  );
}

function ComingSoonPage({ title, subtitle, description }) {
  usePageSeo(
    `${title} | Hinkro Kente`,
    description,
    [title, "Hinkro Kente", "kente weaving services Ghana"],
  );

  return (
    <main className="store-page coming-soon-page" id="coming-soon">
      <section className="store-hero" aria-labelledby="coming-title">
        <p className="store-kicker">{subtitle}</p>
        <h1 id="coming-title">{title}</h1>
        <p>{description}</p>
        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="mailto:ask@hinkrokente.com" className="cta-button">Get in touch</a>
          <a href="/contact-hinkro-kente/" className="cta-button" style={{ background: "transparent", border: "1px solid var(--gold-bright)" }}>Contact us</a>
        </div>
      </section>
    </main>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState(getCurrentPage);
  const [productSlug, setProductSlug] = useState(getProductSlugFromLocation);
  const [blogSlug, setBlogSlug] = useState(getBlogSlugFromLocation);

  useEffect(() => {
    const syncPage = () => {
      setCurrentPage(getCurrentPage());
      setProductSlug(getProductSlugFromLocation());
      setBlogSlug(getBlogSlugFromLocation());
    };

    window.addEventListener("popstate", syncPage);
    syncPage();

    return () => {
      window.removeEventListener("popstate", syncPage);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [currentPage, productSlug, blogSlug]);

  // CollectChat — only load on frontend pages (not homepage, not portal)
  useEffect(() => {
    if (currentPage === "home") {
      // Hide CollectChat launcher if already loaded
      const launcher = document.getElementById("collectchat-container");
      if (launcher) launcher.style.display = "none";
      return;
    }

    // Show launcher if it was hidden
    const launcher = document.getElementById("collectchat-container");
    if (launcher) launcher.style.display = "";

    if (window.CollectId) return; // already loaded

    window.CollectId = "647b6a45cc21ec7a2e93624c";
    const h = document.head || document.getElementsByTagName("head")[0];
    const s = document.createElement("script");
    s.setAttribute("type", "text/javascript");
    s.async = true;
    s.setAttribute("src", "https://collectcdn.com/launcher.js");
    h.appendChild(s);
  }, [currentPage]);

  const navigateRef = React.useRef(null);
  navigateRef.current = () => {
    setCurrentPage(getCurrentPage());
    setProductSlug(getProductSlugFromLocation());
    setBlogSlug(getBlogSlugFromLocation());
  };

  useEffect(() => {
    const handleClick = (e) => {
      const anchor = e.target.closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      if (anchor.target === "_blank") return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (href.startsWith("http") && !href.startsWith(window.location.origin)) return;

      if (href.startsWith("/") && !href.startsWith("/portal")) {
        e.preventDefault();
        window.history.pushState({}, "", href);
        navigateRef.current();
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        return;
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  const policyPageMap = {
    "terms": "terms-and-condition",
    "bespoke-terms": "bespoke-service-terms",
    "lead-time": "lead-time-and-rush-orders",
    "refund": "refund-policy",
    "sample-strip": "sample-strip-policy",
    "privacy": "privacy-policy",
  };

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
        <BlogPage blogSlug={blogSlug} />
      ) : policyPageMap[currentPage] ? (
        <PolicyPage slug={policyPageMap[currentPage]} />
      ) : currentPage === "coming-soon-customized" ? (
        <ComingSoonPage title="Customized Kente Services" subtitle="Coming Soon" description="Our Customized Kente Services page is being prepared. In the meantime, get in touch to discuss your custom kente project." />
      ) : currentPage === "coming-soon-bridal" ? (
        <ComingSoonPage title="Kente Bridal Package" subtitle="Coming Soon" description="Our Kente Bridal Package page is being prepared. Discover our bespoke bridal kente services by getting in touch." />
      ) : currentPage === "coming-soon-weave" ? (
        <ComingSoonPage title="Weave on Demand Kente" subtitle="Coming Soon" description="Our Weave on Demand page is being prepared. Contact us to learn about our on-demand kente weaving services." />
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
