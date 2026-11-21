/* SOOQAK V41 — versioned, read-only parent/subcategory catalog.
   Parent names are intentionally unchanged for compatibility with existing listings. */
(function (root) {
  'use strict';
  const raw = [
    ['سيارات','🚗','Cars',[['sedan','سيدان','Sedans'],['suv','دفع رباعي','SUVs'],['pickup','وانيتات وشاحنات','Pickups and trucks'],['motorcycles','دراجات نارية','Motorcycles'],['parts','قطع غيار سيارات','Car parts']]],
    ['عقارات','🏠','Real Estate',[['land','أراضي','Land'],['apartments','شقق','Apartments'],['villas','فلل','Villas'],['commercial','عقارات تجارية','Commercial'],['farms','مزارع واستراحات','Farms']]],
    ['إلكترونيات','📱','Electronics',[['phones','جوالات','Phones'],['computers','كمبيوترات','Computers'],['gaming','ألعاب وأجهزة','Gaming'],['cameras','كاميرات','Cameras'],['accessories','إكسسوارات إلكترونية','Accessories']]],
    ['أثاث ومنزل','🛋️','Home & Furniture',[['sofas','كنب ومجالس','Sofas'],['bedrooms','غرف نوم','Bedrooms'],['kitchens','مطابخ','Kitchens'],['appliances','أجهزة منزلية','Appliances'],['decor','ديكور ومفروشات','Decor']]],
    ['خدمات','🛠️','Services',[['workshops','ورش سيارات','Auto workshops'],['plumbing','سباكة','Plumbing'],['electrical','كهرباء','Electrical'],['delivery','نقل وتوصيل','Delivery'],['maintenance','صيانة منزلية','Home maintenance']]],
    ['حيوانات','🐪','Animals',[['camels','إبل','Camels'],['sheep','أغنام','Sheep'],['horses','خيول','Horses'],['birds','طيور','Birds'],['supplies','مستلزمات الحيوانات','Animal supplies']]],
    ['مستلزمات شخصية','👜','Personal Items',[['clothing','ملابس','Clothing'],['perfumes','عطور','Perfumes'],['watches','ساعات','Watches'],['bags','شنط','Bags'],['sports','مستلزمات رياضية','Sports']]],
    ['معدات وآليات','🚜','Equipment & Machinery',[['heavy','معدات ثقيلة','Heavy equipment'],['industrial','معدات صناعية','Industrial'],['agriculture','معدات زراعية','Agricultural'],['tools','عدد وأدوات','Tools'],['commercial','معدات محلات','Shop equipment']]],
    ['أخرى','📦','Other',[['books','كتب','Books'],['collectibles','مقتنيات','Collectibles'],['crafts','منتجات يدوية','Handmade'],['free','للتبرع','Free items'],['misc','متفرقات','Miscellaneous']]]
  ];
  const tree = raw.map(([name,icon,en,subs])=>Object.freeze({
    name,icon,en,subcategories:Object.freeze(subs.map(([id,ar,en])=>Object.freeze({id,ar,en})))
  }));
  root.SOOQAK_CATEGORY_TREE = Object.freeze(tree);
})(typeof window !== 'undefined' ? window : globalThis);
