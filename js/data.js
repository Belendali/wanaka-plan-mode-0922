/* What the screens are filled with. One place, so a real API can replace it. */
const TRENDING = [
  { name: 'Knight Rush', art: 'assets/img/card-1.png', by: 'Name Nam...', plays: '17.8k', friends: '17.8k' },
  { name: 'Movie Night', art: 'assets/img/card-2.png', by: 'Name Nam...', plays: '12.4k', friends: '9.1k' },
  { name: 'Goggle Squad', art: 'assets/img/card-3.png', by: 'Name Nam...', plays: '8.9k', friends: '4.5k' },
  { name: 'Zooba Dash', art: 'assets/img/card-4.png', by: 'Name Nam...', plays: '31.2k', friends: '22.7k' },
  { name: 'Ember Chase', art: 'assets/img/card-5.png', by: 'Name Nam...', plays: '5.6k', friends: '2.2k' },
];

/* The plan Wana comes back with. The console reads it, and writes back to it. */
const PLAN = {
  set: 'boy',
  cover: 'assets/console/boy.jpg',
  title: 'Tiny Explorer',
  sub: 'The Giant Bedroom',
  genre: 'Adventure',
  doing: 'Cross a bedroom the size of a country — over the rug, up the blocks, past the truck — to the hoop on the far shelf.',
  feel: 'Small and brave, in a room that was built for someone much bigger.',
  style: 'Default',
  quality: 'High',
  rooms: '4 rooms', assets: '6 assets', mins: '~12 min',
  credits: '320–560', platform: 'Web + Mobile', length: '8–12 min a run',
  form: { genre: 'adventure', style: 'default', quality: 'High', scope: 'standard',
          plat: ['web', 'mobile'], len: 1, diff: 1 },
  parts: [
    ['The bedroom', ['Toy blocks', 'Book stacks', 'Dresser'], 0],
    ['Big toys', ['Basketball', 'Truck', 'Teddy'], -1],
    ['To collect', ['Stars', 'Baseballs', 'Pencils'], -1],
    ['The kid', ['Backpacker', 'Robot pal', 'Dino suit'], -1],
  ],
  partImg: (n) => `assets/console/boy-part-${n.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`,
};

/* What the team says while it drafts the plan. */
const PLAN_STEPS = ['Read your idea', 'Shaping the core loop', 'Choosing a look', 'Sizing the build'];
