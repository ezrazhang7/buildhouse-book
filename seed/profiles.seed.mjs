// Starting rows for the sheet's "Profiles" tab, built from the "Onboarding Info" form responses
// (read 2026-10-07) and the three Canva profile designs. Contact details, e-signatures and dues
// were left out on purpose. `notes` says where each drafted line came from so BuildHouse can check it.
const drive = (id) => `https://drive.google.com/open?id=${id}`;
const DRAFT = 'One-liner drafted from the founding story; confirm with the founder.';

export const rows = [
  {
    publish: 'TRUE', venture: 'Acre', tier: 'Tier 1 Resident', moved_in: '9/2/2026', days_in_space: '5+ days',
    one_liner: 'An agency out of Lafayette’s first incubator cohort, with clients across the East Coast.',
    founders: `Rylan Santos | Founder | https://www.linkedin.com/in/oscar-rylan-santos | Rylan.santos | ${drive('1PAvPtj1loYJn3042DuwfS3GTHs1CZqB8')}`,
    story: `I'm part of an incubator called Lafayette, the first cohort. Worked in NYC this year and have clients across the east coast now! We are now on track to become a subsidiary/part of Lafayettes portfolio as Acre Agency (note: the name is not finalized nor is the logo)`,
    stats: '', needs: 'Client acquisition; Operations & scaling; Mentorship',
    ask: 'A place to build and connect + get outside mentorship for scaling my business.',
    links: '', logo: '',
    notes: `${DRAFT} Name and logo not final, so the uploaded logo is left off. Title "Founder" is assumed.`,
  },
  {
    publish: 'TRUE', venture: 'Beacon Bridge', tier: 'Tier 1 Resident', moved_in: '9/1/2026', days_in_space: '3-4 days',
    one_liner: 'A behavioral health organization serving communities across North Carolina.',
    founders: `Alexander Yousif | | https://www.linkedin.com/in/alexander-yousif | | ${drive('1A1jiGaoJlXO01N4aXDZ4U4IvvpQl-wLu')}`,
    story: `I saw firsthand how difficult it can be for people and families to find consistent support when they need it most. Those experiences became the foundation for Beacon Bridge and its mission to create a different kind of behavioral health organization—one that sees the person before the diagnosis and meets people where they are. The name Beacon Bridge reflects that mission: being a beacon of hope while helping people bridge the gap between where they are and where they want to be.

What started as a personal passion has grown into an organization serving communities across North Carolina, but the heart of the mission remains the same: helping people find hope, build stability, and believe that their circumstances do not have to define their future.`,
    stats: '', needs: 'Cashflow & runway; Compliance & taxes; Operations & scaling',
    ask: "I would love to utilize the learned experience of some of our fellow builders and each other's networks!",
    links: 'LinkedIn | https://www.linkedin.com/company/beacon-bridge', logo: drive('1hrzOj9OBWyiUgxbkXeL6-O0-v2xc38bP'),
    notes: `${DRAFT} Title not given on the form.`,
  },
  {
    publish: 'TRUE', venture: 'Carolina Sky Softwash', tier: 'Tier 1 Resident', moved_in: '9/10/2026', days_in_space: '1-2 days',
    one_liner: 'Exterior soft washing in Orange County, started by a fourth-generation Tar Heel.',
    founders: `William Harris | Founder | https://www.linkedin.com/in/william-harris-07608433b/ | | ${drive('1_9iKlWZsAfDRvjc3Mh0m0U6waSmRTMZG')}`,
    story: `I grew up in Chapel Hill, fourth generation of my family at UNC. I started Carolina Sky Softwash in June 2025 with no prior knowledge of business or pressure washing.

Since then it's grown to four employees, a small fleet, 140 five-star reviews, and the highest rating of any exterior cleaning company in Orange County. About a quarter of our customers are on recurring plans.

What I'm proudest of is that it runs without me. I spent this past summer in London while the crews worked jobs back in North Carolina. I look forward to scaling Carolina Sky to the next level.`,
    stats: `140 | Five-star reviews\n4 | Employees\n1 in 4 | Customers on recurring plans`,
    needs: 'Hiring & labor; Operations & scaling',
    ask: 'To surround myself with a group of like minded entrepreneurs',
    links: 'Instagram | carolina_sky_softwash', logo: drive('1p-cW_GqomBcVT1d4MElxfEJFO70Jqggf'),
    notes: `${DRAFT} Stats are from his founding story.`,
  },
  {
    publish: 'TRUE', venture: 'CJS Cleaning Solutions', tier: 'Tier 1 Remote', moved_in: '7/1/2026', days_in_space: '',
    one_liner: 'Move-out cleaning for renters across the Triangle and Charlotte.',
    founders: `Chris Salazar | Owner | | | ${drive('14yMwFK2W9azlKMtKuNb0RemuqRXOX_VG')}`,
    story: `I've always been an entrepreneur, but CJS started with a bad experience of my own.

I hired a crew for a move-out clean in Chapel Hill, and they showed up late, cut corners, and left the place nowhere near ready for the final walkthrough. I realized how many renters were losing their deposits over the exact same thing.

So I built CJS to be the crew I wish I'd hired: on time, done right, your deposit treated like our own.

It started with one messy move-out in Chapel Hill — today we're across the Triangle and Charlotte.`,
    stats: '', needs: 'Network & community',
    ask: 'Getting to connect with other entrepreneurs and building a strong local foundation.',
    links: 'Instagram | cjscleaningsolutions', logo: drive('1G0jyn5tzm98kbS7KXfiuKpAjC9cQ7LH-'),
    notes: DRAFT,
  },
  {
    publish: 'TRUE', venture: 'Copperline Advisory', tier: 'Tier 3 Resident', moved_in: '6/1/2026', days_in_space: '',
    one_liner: 'Franchise consulting and education for people buying their first franchise.',
    founders: `Connor Groce | Founder | | | ${drive('1vzuvfbD8rFfYz133UKylTLnKZAzgZm8G')}\nColby Groce | | | | ${drive('1x8cjHYVhB2D1Q4VxvjdvDcAv-OmPqsfR')}`,
    story: `After starting my first franchise during my undergraduate time at UNC and my second upon graduation, I learned quite a bit about what separates the winners and losers in the franchising world. I started to get inbound requests from people who wanted to buy a franchise but didn't know where to start or how to identify the right one for them.

That is when I started creating educational content and offering my consulting services to help aspiring business owners identify, evaluate, and find the right franchise opportunity for them.`,
    stats: '', needs: 'Network & community',
    ask: 'Events that foster connection amongst members.',
    links: '', logo: drive('1tAM4DtuBlZK-WKPeImhhQT7zI74y5PKh'),
    notes: `${DRAFT} Two form rows merged (Connor, Tier 3 Resident; Colby, Tier 2 Resident, as "Copper line Advisory"). Colby's role was not given.`,
  },
  {
    publish: 'TRUE', venture: 'Creset', tier: 'Tier 2 Resident', moved_in: '6/1/2026', days_in_space: '',
    one_liner: 'An all-natural, ready-to-drink creatine beverage that keeps the creatine in the cap.',
    founders: `Blake Applegate | Co-founder | | blakeapplegatee\nGarrett Applegate | Co-founder | | _garrettapplegate\nSam Wilkinson | Co-founder | | _samwilkinson\nGrant Bradshaw | Co-founder | | grant._bradshaw16`,
    story: `Before Creset had a name, a product, or even a clear idea, it started as a dream: to escape the conventional path.

In 2024, Blake and Grant first started talking seriously about their entrepreneurial journey. Like most early ideas, the first ones were rough. One of them was simple: “What if we sold shots of creatine in gas stations, pre-loaded in a 4 oz plastic bottle?”

At the time, we had no idea how chemically difficult that would be. We later learned that creatine degrades in water over time, making a true ready-to-drink creatine product far more complicated than we originally thought.

Fast forward to January 2025. Blake and Grant were in Wilmington during a winter storm, brainstorming their next possible venture. Then, a matcha drink appeared on Grant’s Instagram feed. But this wasn’t just another matcha drink — the matcha powder was stored in the cap.

That sparked the idea.

“What if we stored creatine in the cap and created an all-natural, ready-to-drink bottle?”

We started researching and quickly realized there was nothing quite like it on the market. That gave us a sense of reassurance, excitement, and confidence that this idea was worth validating.

Along with hundreds of 3D models, customer interviews, taste tests, and proprietary technology, Creset was born: one of the first all-natural ready-to-drink creatine beverages, built to take on the CPG market starting in Chapel Hill.

Made for people with an attitude of persistent striving toward their goals, Creset is rooted in the mindset that each day is a reset from the last — a new beginning, a new chance to become the person you want to be.`,
    stats: '', needs: 'Marketing & positioning; Client acquisition; Mentorship',
    ask: "A co-working space gives us more than a place to work — BuildHouse puts us around like-minded builders, opens a channel to sell and advertise Creset through their vending, and connects us to mentors who've already gone before us. Resources for media/marketing coaching, media filming studios, customer discovery, and product awareness are all key for us.",
    links: 'Instagram | drinkcreset', logo: drive('1cCZcwEXYzkz5J6YWP_3erwhIzDCzqwsc'),
    notes: `${DRAFT} Story trimmed for length. Four headshots are on the form but not matched to names yet.`,
  },
  {
    publish: 'TRUE', venture: '4C Industrial Solutions', slug: '4cis', tier: 'Tier 1 Remote', moved_in: '6/1/2026', days_in_space: '',
    one_liner: 'Skilled technicians for the conveyor and automated systems inside distribution centers.',
    founders: `Billy Cheek | Founder | | | ${drive('1-Ut-_tYvYmPiqLm2_Z5FJV2T_71o00Jj')}`,
    story: `Coming out of college and getting a standard 8-5 job was never what I planned for my life. I graduated in 2024 and got a sales job in Charlotte. However the excitement of sales dulled with the mundane routine of typical corporate jobs. I would look outside and see the city grow with constant buildings popping up and I reminisced on the summers I spent working construction.

Luckily I had a family friend with a subcontracting business who was looking for guys to help him grow his business so he let me join and mentored me by throwing me in the deep end of going on site, running teams and finding new opportunities to supply labor.

Throughout this time I have been able to find specific areas where I want to focus on for General Contractors in need of quality skilled labor. As the online shopping industry grows so does companies' distribution centers and that means their conveyor and automated systems need to be improved. The shortage is finding proper technicians to do that, this is where 4CIS comes in.`,
    stats: '', needs: 'Network & community',
    ask: 'I want to be able to explore ideas and be creative with others to not only help my business grow but contribute to others. Also explore and collaborate new ideas to even make new businesses.',
    links: '', logo: drive('1BE8065Okq33umKaCT3DxxvrjdX1S2Bvw'),
    notes: `${DRAFT} Title "Founder" is assumed. Two typos in the story fixed ("was like for guys", "General Contractor's").`,
  },
  {
    publish: 'TRUE', venture: 'HiM Coaching', tier: 'Tier 1 Remote', moved_in: '6/3/2026', days_in_space: '',
    one_liner: 'Engagement coaching for leaders, teams and organizations, from healthcare and former sports professionals.',
    founders: `Jake McDowell | Co-founder\nJay Harding | Co-founder`,
    story: `We are current healthcare and former sports professionals who understand firsthand the challenges of building personal and team engagement, aligning diverse stakeholders, fostering accountability, and driving meaningful outcomes in high-pressure environments.

Through our experience, we've developed a passion for helping individuals and teams strengthen their engagement capabilities to elevate their ability to achieve results with teams, patients, athletes, clients and partners. HiM Coaching is all about transforming leaders, teams, and organizations through engagement excellence.`,
    stats: '', needs: 'Network & community',
    ask: 'The ability to network and communicate with other company builders and understand their needs and opportunities to grow their business.',
    links: '', logo: drive('1r09RAtwbi5xP4CZ6zPl--QaTlE7e9u-s'),
    notes: `${DRAFT} Three headshots on the form, not matched to names yet.`,
  },
  {
    publish: 'TRUE', venture: 'Jordan AI', tier: 'Tier 1 Resident', moved_in: '9/4/2026', days_in_space: '5+ days',
    one_liner: 'Software and AI tools for home builders.',
    founders: `Blake Mechels | Founder | https://www.linkedin.com/in/blake-mechels/ | blake.mechels | ${drive('1q-nrMq3Q7KxTJNGnUJkVv9kksvl0R2c2')}`,
    story: `I'm originally from Boulder, Colorado, where I started my first business in high school when I was 16 doing landscaping and odd jobs. Since then, I've continued my entrepreneurial journey, first in college by creating an app to match college students with freelance work.

I later started working on the concept of Jordan AI when working with a small home builder in Houston. Since then, I've grown it to encompass bigger clients and help solve a variety of issues across the home building process.`,
    stats: '', needs: 'Product & software',
    ask: 'The biggest focus right now in my business is developing high quality, unique software and AI tools for my clients. Any resources that the community can provide in helping me with any tips on that process or how to overall scale my system and AI stack to work efficiently would be helpful.',
    links: '', logo: '',
    notes: `${DRAFT} He said he has no logo yet, so the uploaded file is left off. Title "Founder" is assumed.`,
  },
  {
    publish: 'TRUE', venture: 'Markit Advertising', tier: 'Tier 1 Resident', moved_in: '9/1/2026', days_in_space: '1-2 days',
    one_liner: '',
    founders: `Justin Sonnenreich | Founder | https://www.linkedin.com/in/justinsonnenreich | justinsonnenreich | ${drive('1bybgA7tqymFKSOqoyZCOgqlklRFtcYCW')}`,
    story: '', stats: '', needs: 'Hiring & labor; Client acquisition; Operations & scaling',
    ask: '',
    links: 'LinkedIn | https://www.linkedin.com/company/markitads/\nFounder’s site | https://justinsonnenreich.com/', logo: drive('1LOa9NVE-QqW5mZtcVe0xBTIMhmH9Xuko'),
    notes: 'Needs a one-liner and a story: the form answer was a link to his site. Support answer was "I will find out." LinkedIn URL built from "@justinsonnenreich on all handles"; check it. Title "Founder" is assumed.',
  },
  {
    publish: 'TRUE', venture: 'Party With A Twist', tier: 'Tier 1 Remote', moved_in: '8/1/2026', days_in_space: '',
    one_liner: 'Balloon artists, face painters and entertainers for events across the Carolinas.',
    founders: `Daniel Oringel | Founder | | danieloringel | ${drive('1Cekal1l0nvopVltiI-GXr-GyI3S1dHFD')}`,
    story: `In 2017, 12-year-old Daniel got his first balloon animal kit. For Valentine’s Day, he set up a table selling balloon flowers to the neighborhood. Daniel reached out to local businesses to start making more balloon animals and start face painting.

9 years later, Daniel has hired and trained dozens of entertainers in the Carolinas to join his company. He is always finding ways to get better at his craft. Everyone at Party With A Twist is here because they love making people happy through their art form. They constantly meet to come up with new and improved designs and ways to keep kids entertained, and they have no plans of slowing down anytime soon.`,
    stats: `2017 | First balloon kit, at age 12\nDozens | Entertainers hired and trained`,
    needs: 'Mentorship',
    ask: 'Meeting with somebody in the program once a week, or at least once a month, in any capacity: at the grounds, grabbing a beer, etc.',
    links: 'Instagram | partywithatwist.fun', logo: drive('168MpPnoi3AR27JXZq1pcpw1ynT9LuXKK'),
    notes: `${DRAFT} Stats are from his founding story. Title "Founder" is assumed.`,
  },
  {
    publish: 'TRUE', venture: 'Raleigh Photobooth & Entertainment Co.', slug: 'raleigh-photobooth', tier: 'Tier 1 Remote', moved_in: '6/1/2026', days_in_space: '',
    one_liner: 'Photobooths plus a bench of subcontracted vendors, so clients can plan event entertainment in one stop.',
    founders: `Ethan Jacobs | Founder | | | ${drive('1W7USfMDEH0bRNJ1W6yqs4rKCWp74CGhn')}\nSowmya Gouru | Partner`,
    story: `I started working for a dj for extra cash who had a photobooth business on the side. After my first event, I ran the numbers in my head and realized what an opportunity this was. I knew I could do the same thing if I saved up money, but I could do it better.

I bartended downtown Raleigh and downtown Chapel Hill at Goodfellows, so I had plenty of contacts of small business vendors who I could subcontract for events and offer even more of a one-stop-shop experience for clients planning their events. Combining convenience with high quality/low costs, I was able to build my entertainment business into what it is today—organically. I am looking to scale and begin marketing soon.`,
    stats: '', needs: 'Hiring & labor; Marketing & positioning; Network & community',
    ask: 'Connections to potential employees, likeminded individuals, and business advice.',
    links: 'Instagram | Raleigh.photoboothco', logo: drive('19u86TVh7W2m1N1J3gT-b5xwlXJJmo1HO'),
    notes: `${DRAFT} Sowmya is listed on the form as "Employee/Partner". Title "Founder" is assumed.`,
  },
  {
    publish: 'TRUE', venture: 'Squeaky C’s Mobile Detailing', slug: 'squeaky-cs', tier: 'Tier 1 Resident', moved_in: '9/2/2026', days_in_space: '3-4 days',
    one_liner: 'Fully mobile premium detailing: ceramic coatings, paint correction and interior restoration, done in the driveway.',
    founders: `Chris Vaughan | Founder | https://www.linkedin.com/in/chrisv98/ | chrisvaughan_ | ${drive('1Ymwlyq95vJfFNDbCP7Zyoh_1LBgqxQrD')}\nMacon Lawrence | Detailer\nJP Connell | Consultant and advisor`,
    story: `Founded in August 2025 by Raleigh native Chris Vaughan, Squeaky C’s Mobile Detailing began as a favorite side gig born out of a deep appreciation for the ultimate "before and after" transformation. What started as a solo passion project quickly grew into a trusted, fully mobile premium detailing service serving the Triangle, Triad, Charlotte metro, and Eastern NC. Equipped with its own self-contained water and power supplies, Squeaky C's brings professional-grade ceramic coatings, paint correction, and deep interior restoration directly to premium vehicle owners.

Chris Vaughan brings a unique background to the service-based entrepreneurship space as a current dental student. While dentistry and car detailing might seem worlds apart, Chris views them as two sides of the same coin: both demand an intense, meticulous attention to detail and surgical precision. Bringing that exact same millimeter-level focus from the dental clinic to the driveway, Chris has built Squeaky C’s into a 5-star rated operation focused on delivering pristine, professional resets for every vehicle they touch.`,
    stats: `Aug 2025 | Founded\n5-star | Rated operation`,
    needs: 'Hiring & labor; Client acquisition; Compliance & taxes; Operations & scaling',
    ask: 'Mentorship, a community of entrepreneurs, and a network of amazing individuals who can share their knowledge and experience.',
    links: 'Website | https://squeakyc.com\nInstagram | squeakycsmobiledetailing\nTikTok | https://www.tiktok.com/@squeakycautodetailing', logo: drive('1cgWrLoccd6KAJEDSp0WKUUzSD1Ghby-g'),
    notes: `${DRAFT} Stats are from the founding story.`,
  },
  {
    publish: 'TRUE', venture: 'Stomp Out Hunger', tier: 'Tier 1 Resident', moved_in: '8/15/2026', days_in_space: '',
    one_liner: 'A student-run food recovery initiative in Chapel Hill that began with a shared meal on Franklin Street.',
    founders: `Dabney Hughes | Co-founder, executive director | | dabn3y\nTommy Mierzwa | Co-founder | | tommy_mierzwa\nErika Allison | Co-founder | | erika.allison\nAlicia Gebara | Director of community engagement | | liciagebara\nJaden Miller | Director of partnerships | | jadenbmiller\nGriffin Lewison | Director of operations | | griffin_lewison`,
    story: `I was walking down Franklin around the time when most restaurants close. A man living on the streets approached me and asked for food. I was used to getting pitched for spare change, but food felt different - more human and more urgent. I was already on my way to the dining hall, so I told him to wait right where he was, I told him I'd be back in 15 minutes.

I snagged some styrofoam to-go plates and sneakily loaded them up in the dining hall with Chimichurri steak and Potatoes. I went over to Supdogs and asked for water cups and forks. I took the food over and shared a meal with him. He shared his story, I shared mine.

Inspired by that quiet moment, I set up an interview with IFC Community Kitchen's Food Systems manager. Within an hour, I identified her needs and hit the ground running. I forged partnerships with Speedi Delivery and Roots Natural Kitchen, enabling me to recover 40 pounds of food every night without getting off the couch. I built up a team, scheduled weekly meetings so we could bounce ideas off of each other. I built a website and forms system to automate everything. I built up a circle of mentors - older folks in business and food systems who were happy to share their wisdom.

It's been over a year since that first meal - I still love building up this little initiative. I hope to set an example for the younger students still finding their way - if you're pissed about what you see in the news, start something real and impactful nearby.`,
    stats: `40 lb | Food recovered every night\n1+ year | Running`,
    needs: 'Mentorship; Network & community',
    ask: 'Meeting space for me and my team to meet weekly with a whiteboard. An active community who uses the space and is outgoing. A mentor meeting booking calendar.',
    links: 'Instagram | stompouthungerunc', logo: drive('1Qw_GZjtv8P-Y_7YVZEn3UqC9itHs7fvw'),
    notes: `${DRAFT} Story trimmed, and the first name of the man in the story removed since he did not submit it. Stats are from the story. Five headshots on the form, not matched to names yet.`,
  },
  {
    publish: 'TRUE', venture: 'TidalCleanse', tier: 'Tier 1 Remote', moved_in: '8/9/2026', days_in_space: '',
    one_liner: 'Turning the sargassum seaweed crisis in the USVI into high-value cosmetic ingredients sold B2B to beauty brands.',
    founders: `Hiyaa Rathod | Founder & CEO | https://www.linkedin.com/in/hiyaarathod | | ${drive('1Y37Cnyhpc4-A7nX6MvRrVKeU2n2lFs1C')}\nLing Xiong | Team | https://www.linkedin.com/in/ling-xiong/`,
    story: '',
    stats: `1st place | Global LIFT Challenge, $10,000 (Oct 2025)\nTop 38 of 220 | Values & Ventures semi-finals (Apr 2026)\n$1,000 | 1789 Student Venture Fund\nNSF I-Corps | Selected, summer 2026`,
    needs: 'Mentorship; Marketing & positioning; Network & community',
    ask: 'Accountability, tangible progress, structured execution systems, people consistently shipping and pressure-testing ideas, genuine community beyond work, openness about goals, fears and challenges, help with narrative and positioning, ambitious high-agency people, honest feedback and collaboration, proximity to people who change trajectories.',
    links: '', logo: drive('130it0c77iJmPbno0pOjNdmJV0vMMR60O'),
    notes: 'One-liner and stats are from the Canva profile. Founding story on the form is a link to a Google Doc; paste the text into the story column.',
  },
  {
    publish: 'TRUE', venture: 'Triangle Hydro Solutions', tier: 'Tier 2 Resident', moved_in: '6/1/2026', days_in_space: '',
    one_liner: 'A student-owned window cleaning company based in Chapel Hill, delivering high-quality service and creating flexible, well-paying jobs for students.',
    founders: `Wes Spykerman | Co-founder, operations lead | https://www.linkedin.com/in/wesspykerman/ | thewesspykerman\nNoah Shroff | Co-founder & owner | https://www.linkedin.com/in/noahshroff/ | noahshroff`,
    story: `We’re just two best friends who always knew we wanted to build something together.

Last summer, Wes was doing door-to-door sales and came across the window cleaning space. He saw the opportunity right away and called Noah, who grew up around a successful family business and understood what it takes to scale. We decided to go all in.

Since then, we’ve built Triangle Hydro Solutions by focusing on two things: creating real opportunities for students and delivering a level of service homeowners can trust.

We’re proud to serve families in Chapel Hill and are continuing to grow into other college towns, staying true to the same mission everywhere we go.`,
    stats: `100+ | Homes cleaned\n5-figure | Revenue generated\n3x | More jobs since May`,
    needs: '', ask: '',
    links: 'Instagram | trianglehydrosolutions', logo: drive('1FNoB2OmjJecXKzlMIl2mvjepuk5L5gxn'),
    notes: 'One-liner, stats and Wes\'s title are from the Canva profile ("100+ homes" was cut off in the export, label is a guess). No support answer on the form. Two headshots, not matched to names yet.',
  },
  {
    publish: 'TRUE', venture: 'Trybl', tier: 'Tier 2 Resident', moved_in: '6/1/2026', days_in_space: '',
    one_liner: 'Technology meant to make your world smaller in the ways that matter: more rooted, more connected to the people around you.',
    founders: `Hakeem Shitta-Bey | Co-founder & CEO | https://www.linkedin.com/in/hakeem-bey | hakeem.bey5\nChristopher Williams | Co-founder & COO | https://www.linkedin.com/in/christopher-williams-cw0362 | chrislewilliams7\nNatnael Worku | Co-founder & CTO | https://www.linkedin.com/in/natnaelworku | xonaati`,
    story: `We write this with a sense of eagerness and resolve that has only grown since our initial start in the summer of 2025. What began with our principal founder, Hakeem, soon expanded into a lean team that added a technical founder in Natnael and a commercialization and public affairs founder in Christopher. Even before coming together in this way, we were already friends and fraternity brothers.

Those conversations eventually led us to focus more seriously on the state of human interaction in a digital age. Are we interacting in the ways we were wired to as humans? Has social media, in many ways, failed us? In being so digitally connected, have we lost something essential all the same?

What we found is that in a world that is more digitally connected than ever, people often feel lonelier than ever before. It is quite the dilemma—and one we want to solve. We are betting on ourselves—two Duke students and one UNC student—willing to take the risk.

Trybl exists to realign the digital world with the human one—to bring us back to what we were always designed for: community. We do not believe the answer is to abandon technology. We believe the answer is to remember what it is for.`,
    stats: `Summer 2025 | Started\n3 | Co-founders, two at Duke and one at UNC`,
    needs: 'Fundraising & equity; Legal & incorporation',
    ask: 'Mentorship regarding finance operation & equity splits in the pre-seed and subsequent seed rounds. Guidance on the best way to incorporate.',
    links: '', logo: drive('13FOTgw3ZZC8GTaQ_yuu7lfWRAT81kfwt'),
    notes: 'One-liner adapted from the last lines of their story. Story cut down from about 700 words; every sentence kept is theirs. Three headshots, not matched to names yet.',
  },
  {
    publish: 'FALSE', venture: 'Kit 14 Public Relations', tier: 'Vendor Resident', moved_in: '7/6/2026', days_in_space: '',
    one_liner: '',
    founders: `Kevin Mitchell | Founder | https://www.linkedin.com/in/kevinjoemitchell | kit_fourteen | ${drive('1vQ0EN_RT8J_PPkBDxWxdNJBZZ8aTcALF')}`,
    story: '', stats: '', needs: '', ask: '', links: '', logo: drive('1Ln4wjRuPpjUPev5eUKaB6EMwrtqB-3Nj'),
    notes: 'Held back: no story, one-liner or support answer on the form. Vendor resident, so decide whether it belongs in the mentor book at all.',
  },
  {
    publish: 'FALSE', venture: 'ThreatSecOps', tier: 'Tier 1 Resident', moved_in: '6/6/2026', days_in_space: '',
    one_liner: '',
    founders: `Aaryon Brown | | | | ${drive('1t_jG_dp3k9wnVzwiofqrEODp2ohO0KP_')}`,
    story: '', stats: '', needs: '', ask: '', links: '', logo: drive('1MqJbBuONVImfAehKs4eGwZRngkMAApK-'),
    notes: 'Held back: the form has a name, headshot and logo only.',
  },
];
