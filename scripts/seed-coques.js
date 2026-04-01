const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://zkqnydmlvueaosxykwmc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcW55ZG1sdnVlYW9zeHlrd21jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ1OTM1MiwiZXhwIjoyMDkwMDM1MzUyfQ.ejSTCCe6f9d8knhP2PDK6ZLwQxd6z8vOXAALGfEzHic'
)

const coques = [
  { slug:'luna', name:'Luna', label:'Licorne Rose', emoji:'🦄', img:'/images/device/p02.jpg', hex_color:'#EC4899', description:'Luna est la coque licorne arc-en-ciel.', tags:['fille','licorne','rose'], price:14.99, active:true, popular:true, is_new:false, display_order:1 },
  { slug:'ariel', name:'Ariel', label:'Sirene Princesse', emoji:'🧜', img:'/images/device/p12.jpg', hex_color:'#14B8A6', description:'Ariel plonge votre enfant dans les fonds marins.', tags:['fille','sirene','mer'], price:14.99, active:true, popular:true, is_new:false, display_order:2 },
  { slug:'drago', name:'Drago', label:'Dragon Vert', emoji:'🐉', img:'/images/device/p13.jpg', hex_color:'#22C55E', description:'Drago est un petit dragon kawaii.', tags:['garcon','dragon'], price:14.99, active:true, popular:true, is_new:false, display_order:3 },
  { slug:'fantome', name:'Fantome', label:'Fantome Kawaii', emoji:'👻', img:'/images/device/p17.jpg', hex_color:'#9333EA', description:'Ce petit fantome translucide est la coque la plus originale.', tags:['fantome'], price:14.99, active:true, popular:false, is_new:true, display_order:4 },
  { slug:'bambou', name:'Bambou', label:'Panda', emoji:'🐼', img:'/images/device/p05.jpg', hex_color:'#18181B', description:'Bambou est un panda tout en rondeurs.', tags:['panda'], price:14.99, active:true, popular:true, is_new:false, display_order:5 },
  { slug:'pablo', name:'Pablo', label:'Pingouin', emoji:'🐧', img:'/images/device/p03.jpg', hex_color:'#64748B', description:'Pablo le pingouin avec son ventre blanc.', tags:['pingouin'], price:14.99, active:true, popular:true, is_new:false, display_order:6 },
  { slug:'aviateur', name:'Aviateur', label:'Avion Bleu', emoji:'✈️', img:'/images/device/p21.jpg', hex_color:'#3B82F6', description:'Un adorable avion bleu pour les futurs pilotes.', tags:['avion','bleu'], price:14.99, active:true, popular:false, is_new:true, display_order:7 },
  { slug:'lola', name:'Lola', label:'Lapin Blanc', emoji:'🐰', img:'/images/device/p09.jpg', hex_color:'#F43F5E', description:'Lola est un lapin tout blanc aux longues oreilles roses.', tags:['fille','lapin'], price:14.99, active:true, popular:true, is_new:false, display_order:8 },
  { slug:'mimi', name:'Mimi', label:'Chat Gris', emoji:'🐱', img:'/images/device/p07.jpg', hex_color:'#9CA3AF', description:'Mimi est un chat gris avec ses moustaches.', tags:['fille','chat'], price:14.99, active:true, popular:false, is_new:false, display_order:9 },
  { slug:'ellie', name:'Ellie', label:'Elephant', emoji:'🐘', img:'/images/device/p15.jpg', hex_color:'#94A3B8', description:'Ellie avec ses grandes oreilles rondes.', tags:['elephant'], price:14.99, active:true, popular:false, is_new:true, display_order:10 },
  { slug:'pompier', name:'Pompier', label:'Camion de Pompier', emoji:'🚒', img:'/images/device/p16.jpg', hex_color:'#EF4444', description:'Un camion de pompier kawaii pour les futurs heros.', tags:['pompier','rouge'], price:14.99, active:true, popular:true, is_new:false, display_order:11 },
  { slug:'flash', name:'Flash', label:'Voiture de Course', emoji:'🏎️', img:'/images/device/p14.jpg', hex_color:'#DC2626', description:'Flash est une voiture de course rouge.', tags:['voiture','rouge'], price:14.99, active:true, popular:true, is_new:false, display_order:12 },
  { slug:'herisson', name:'Herisson', label:'Herisson', emoji:'🦔', img:'/images/device/p22.jpg', hex_color:'#F59E0B', description:'Ce herisson avec ses piquants en relief est irresistible.', tags:['herisson'], price:14.99, active:true, popular:false, is_new:true, display_order:13 },
  { slug:'rex', name:'Rex', label:'Dinosaure T-Rex', emoji:'🦕', img:'/images/device/p25.jpg', hex_color:'#16A34A', description:'Rex est un T-Rex vert vif.', tags:['garcon','dinosaure'], price:14.99, active:true, popular:true, is_new:false, display_order:14 },
  { slug:'roux', name:'Roux', label:'Renard', emoji:'🦊', img:'/images/device/p20.jpg', hex_color:'#F97316', description:'Roux est un renard orange malicieux mais adorable.', tags:['renard'], price:14.99, active:true, popular:false, is_new:false, display_order:15 },
  { slug:'pip', name:'Pip', label:'Caneton Jaune', emoji:'🐣', img:'/images/device/p06.jpg', hex_color:'#EAB308', description:'Pip est un caneton jaune tout rond.', tags:['canard','jaune'], price:14.99, active:true, popular:false, is_new:false, display_order:16 },
  { slug:'leo', name:'Leo', label:'Lionceau', emoji:'🦁', img:'/images/device/p01.jpg', hex_color:'#D97706', description:'Leo est un lionceau marron courageux.', tags:['garcon','lion'], price:14.99, active:true, popular:false, is_new:false, display_order:17 },
  { slug:'nino', name:'Nino', label:'Petit Ours', emoji:'🐻', img:'/images/device/p08.jpg', hex_color:'#92400E', description:'Nino est un petit ours brun doux et calin.', tags:['ours'], price:14.99, active:true, popular:false, is_new:false, display_order:18 },
  { slug:'orso', name:'Orso', label:'Ours Noir', emoji:'🐻‍❄️', img:'/images/device/p04.jpg', hex_color:'#3F3F46', description:'Orso est un ours noir et blanc au look graphique.', tags:['ours','noir'], price:14.99, active:true, popular:false, is_new:true, display_order:19 },
  { slug:'caramel', name:'Caramel', label:'Ours Peche', emoji:'🍑', img:'/images/device/p10.jpg', hex_color:'#FB923C', description:'Caramel est un ours peche aux couleurs chaudes.', tags:['fille','ours'], price:14.99, active:true, popular:false, is_new:false, display_order:20 },
  { slug:'coton', name:'Coton', label:'Grand Lapin', emoji:'🐰', img:'/images/device/p11.jpg', hex_color:'#FDA4AF', description:'Coton est un grand lapin blanc aux longues oreilles.', tags:['fille','lapin'], price:14.99, active:true, popular:false, is_new:false, display_order:21 },
  { slug:'fantasia', name:'Fantasia', label:'Surprise', emoji:'✨', img:'/images/device/p19.jpg', hex_color:'#A855F7', description:'Fantasia est la coque mystere qui se devoile a la reception.', tags:['mystere'], price:14.99, active:true, popular:false, is_new:true, display_order:22 },
]

async function seed() {
  const { error } = await supabase.from('coques').upsert(coques, { onConflict: 'slug' })
  if (error) {
    console.error('Erreur:', error.message)
  } else {
    console.log('22 coques inserees OK')
    const { count } = await supabase.from('coques').select('*', { count: 'exact', head: true })
    console.log('Total coques en base:', count)
  }
}

seed()
