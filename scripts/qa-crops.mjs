import sharp from 'sharp';
await sharp('qa/home-390.png').extract({left:0,top:0,width:390,height:1450}).png().toFile('qa/mobile-top.png');
await sharp('qa/home-1440.png').extract({left:0,top:0,width:1440,height:1200}).resize(1200).png().toFile('qa/desktop-top.png');
