(function(root){
const works=[
 {img:"work-01.jpg",title:"Crossing",desc:"Two forces meet, and neither yields.",medium:"Acrylic on canvas · 70 × 90 cm · 2024",tags:["gesture","colour"]},
 {img:"work-02.jpg",title:"Tempest",desc:"Weather with a temper. Silver and blood, refusing to settle.",medium:"Acrylic & mixed media · 70 × 90 cm · 2023",tags:["colour","gesture"]},
 {img:"work-03.jpg",title:"Crimson Ascent",desc:"Red climbing out of its own wreckage.",medium:"Acrylic on canvas · 60 × 80 cm · 2024",tags:["colour","gesture"]},
 {img:"work-04.jpg",title:"Cacophony",desc:"Every voice at once — and somehow, a chord.",medium:"Mixed media · 90 × 120 cm · 2023",tags:["colour"]},
 {img:"work-05.jpg",title:"Resonance",desc:"A struck note you can see before you hear it.",medium:"Acrylic on canvas · 60 × 90 cm · 2024",tags:["colour","gesture"]},
 {img:"work-06.jpg",title:"First Light",desc:"The quietest violence in the room.",medium:"Acrylic on canvas · 60 × 80 cm · 2024",tags:["gesture"]},
 {img:"work-07.jpg",title:"Festival",desc:"Joy with no brakes on.",medium:"Acrylic on canvas · 80 × 80 cm · 2023",tags:["colour"]},
 {img:"work-08.jpg",title:"Constellation",desc:"A night sky that forgot to hold still.",medium:"Mixed media · 90 × 120 cm · 2023",tags:["colour","gesture"]},
 {img:"work-09.jpg",title:"Bloom in Chaos",desc:"Spring, if spring were an argument.",medium:"Acrylic on canvas · 80 × 80 cm · 2024",tags:["colour"]},
 {img:"work-10.jpg",title:"Nightshade",desc:"Beautiful, and not to be touched.",medium:"Acrylic on canvas · 60 × 80 cm · 2024",tags:["colour","gesture"]},
 {img:"work-11.jpg",title:"Monochrome Study",desc:"Everything loud, said in two colours.",medium:"Acrylic on canvas · 70 × 90 cm · 2023",tags:["monochrome","gesture"]},
 {img:"work-12.jpg",title:"Inferno",desc:"A slow burn that refuses to go out.",medium:"Acrylic on canvas · 70 × 90 cm · 2024",tags:["colour","gesture"]},
 {img:"work-13.jpg",title:"Devotion",desc:"Gold held together by its own dark gravity.",medium:"Acrylic & gold on canvas · 60 × 80 cm · 2024",tags:["ink","gesture"]},
 {img:"work-14.jpg",title:"Whisper",desc:"The least paint, saying the most.",medium:"Ink & gold on paper · 70 × 70 cm · 2024",tags:["ink","monochrome"]},

 /* ═══ A305X series — Area 305 / Miami collage cards ═══ (shows under "A305X" — add more with tags:["a305x"]) */
 {img:"a305x/a305x-01.webp",title:"Between Sun & Shadow",desc:"Miami, 305 — the city caught between sun and shadow.",medium:"Mixed-media collage · 2025",tags:["a305x"]},
 {img:"a305x/a305x-02.webp",title:"Analog Paradise",desc:"Area 305, Signal 04 — paradise, transmitted by hand.",medium:"Mixed-media collage · 2025",tags:["a305x"]},
 {img:"a305x/a305x-03.webp",title:"Afterglow",desc:"Miami, Florida — the arch, the sea, the last of the light.",medium:"Mixed-media collage · 2025",tags:["a305x"]},

 /* ═══ Zodiac series ═══  (shows under "Zodiac" — add more with tags:["zodiac"]) */
 {img:"zodiac/zodiac-01.webp",title:"Ascend",desc:"Gold lifts out of the red like a held breath released.",medium:"Oil & gold leaf on canvas · diptych · 2025",tags:["zodiac"]},
 {img:"zodiac/zodiac-02.webp",title:"Orbit",desc:"Five still points, and a blue ring that will not stop turning.",medium:"Oil & pigment on canvas · diptych · 2025",tags:["zodiac"]},
 {img:"zodiac/zodiac-03.webp",title:"Aperture",desc:"A single eye of gold, opened in a field of fire.",medium:"Oil & gold leaf on canvas · diptych · 2025",tags:["zodiac"]},
 {img:"zodiac/zodiac-04.webp",title:"Crown",desc:"Black rises from red — a crest, a flame, a coronation.",medium:"Oil on canvas · diptych · 2025",tags:["zodiac"]},
 {img:"zodiac/zodiac-05.webp",title:"Covenant",desc:"Two forms bound at the centre, refusing to part.",medium:"Oil on canvas · diptych · 2025",tags:["zodiac"]},
 {img:"zodiac/zodiac-06.webp",title:"Scorpius",desc:"The scorpion, laid in black across a burning sky.",medium:"Oil & mixed media on canvas · diptych · 2025",tags:["zodiac"]},
 {img:"zodiac/zodiac-07.webp",title:"Benediction",desc:"Two gold arms open over a still, dark heart.",medium:"Oil & gold leaf on canvas · diptych · 2025",tags:["zodiac"]},
 {img:"zodiac/zodiac-08.webp",title:"Radiance",desc:"Leo — the light it cannot help but throw.",medium:"Mixed-media collage · 2025",tags:["zodiac"]},
 {img:"zodiac/zodiac-09.webp",title:"Integrity",desc:"Virgo — every line true, nothing out of place.",medium:"Mixed-media collage · 2025",tags:["zodiac"]},
 {img:"zodiac/zodiac-10.webp",title:"Endurance",desc:"Capricorn — holding the long line without complaint.",medium:"Mixed-media collage · 2025",tags:["zodiac"]},
 {img:"zodiac/zodiac-11.webp",title:"Resolve",desc:"Capricorn — the climb decided before the first step.",medium:"Mixed-media collage · 2025",tags:["zodiac"]},
 {img:"zodiac/zodiac-12.webp",title:"Equilibrium",desc:"Libra — weighing the world until it balances.",medium:"Mixed-media collage · 2025",tags:["zodiac"]},
 {img:"zodiac/zodiac-13.webp",title:"Curiosity",desc:"Gemini — two minds, one restless question.",medium:"Mixed-media collage · 2025",tags:["zodiac"]},
 {img:"zodiac/zodiac-14.webp",title:"Innovation",desc:"Aquarius — pouring the new thing into an old sky.",medium:"Mixed-media collage · 2025",tags:["zodiac"]},
 {img:"zodiac/zodiac-15.webp",title:"Nurture",desc:"Cancer — the moon cradled in quiet water.",medium:"Mixed-media collage · 2025",tags:["zodiac"]},
];
works.forEach((w,i)=>{w.slug=w.title.toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");w.kind=i<14?"Original artwork":"Artwork study";w.collection=i<14?"originals":"collage";});
if(typeof module==="object"&&module.exports)module.exports=works;else root.IvosArtWorks=works;
})(typeof globalThis!=="undefined"?globalThis:this);
