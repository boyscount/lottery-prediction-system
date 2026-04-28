import { DreamEntry } from '../types'

export const dreamDatabase: DreamEntry[] = [
  // ======= สัตว์ ANIMALS =======
  {
    id: 'snake', thaiName: 'งู', englishName: 'Snake', category: 'animals',
    description: 'ฝันเห็นงู มักหมายถึงโชคลาภ เงินทอง หรือคนที่คิดร้าย',
    twoDigit: [12, 39, 67, 89, 92], threeDigit: [129, 390, 679, 892, 392], confidence: 78,
    tags: ['สัตว์เลื้อยคลาน', 'โชคลาภ', 'เงิน']
  },
  {
    id: 'big_snake', thaiName: 'งูใหญ่', englishName: 'Big Snake', category: 'animals',
    description: 'ฝันเห็นงูใหญ่ หมายถึงโชคใหญ่ลาภหนา',
    twoDigit: [92, 29, 12, 59, 95], threeDigit: [929, 192, 259, 952, 129], confidence: 82,
    tags: ['งูใหญ่', 'โชคใหญ่']
  },
  {
    id: 'cobra', thaiName: 'งูเห่า', englishName: 'Cobra', category: 'animals',
    description: 'ฝันเห็นงูเห่า ระวังศัตรู แต่ก็มีโชคลาภซ่อนอยู่',
    twoDigit: [92, 29, 39, 93, 12], threeDigit: [923, 293, 392, 129, 912], confidence: 75,
    tags: ['งูพิษ', 'ระวัง']
  },
  {
    id: 'elephant', thaiName: 'ช้าง', englishName: 'Elephant', category: 'animals',
    description: 'ฝันเห็นช้าง มงคลยิ่ง หมายถึงความยิ่งใหญ่ ความมั่งคั่ง',
    twoDigit: [8, 48, 74, 77, 88], threeDigit: [480, 748, 770, 488, 874], confidence: 72,
    tags: ['มงคล', 'ใหญ่', 'มั่งคั่ง']
  },
  {
    id: 'white_elephant', thaiName: 'ช้างเผือก', englishName: 'White Elephant', category: 'animals',
    description: 'ฝันเห็นช้างเผือก โชคมหาศาล ลาภใหญ่กำลังมา',
    twoDigit: [6, 16, 66, 86, 68], threeDigit: [616, 660, 866, 168, 681], confidence: 90,
    tags: ['มงคลสูงสุด', 'โชคใหญ่']
  },
  {
    id: 'tiger', thaiName: 'เสือ', englishName: 'Tiger', category: 'animals',
    description: 'ฝันเห็นเสือ หมายถึงอำนาจ บารมี มีคนช่วยเหลือ',
    twoDigit: [79, 97, 17, 71, 37], threeDigit: [790, 970, 179, 713, 379], confidence: 68,
    tags: ['อำนาจ', 'บารมี']
  },
  {
    id: 'lion', thaiName: 'สิงโต', englishName: 'Lion', category: 'animals',
    description: 'ฝันเห็นสิงโต หมายถึงความกล้า อำนาจ โชคลาภ',
    twoDigit: [79, 97, 14, 41, 47], threeDigit: [794, 970, 414, 741, 479], confidence: 65,
    tags: ['กล้า', 'อำนาจ']
  },
  {
    id: 'cat', thaiName: 'แมว', englishName: 'Cat', category: 'animals',
    description: 'ฝันเห็นแมว หมายถึงความรัก ความสุขในบ้าน',
    twoDigit: [11, 62, 22, 44, 21], threeDigit: [116, 622, 224, 441, 216], confidence: 65,
    tags: ['รัก', 'บ้าน']
  },
  {
    id: 'dog', thaiName: 'หมา/สุนัข', englishName: 'Dog', category: 'animals',
    description: 'ฝันเห็นหมา หมายถึงมิตรภาพ ความซื่อสัตย์ มีคนช่วย',
    twoDigit: [2, 52, 81, 29, 25], threeDigit: [520, 812, 295, 252, 812], confidence: 62,
    tags: ['มิตรภาพ', 'ซื่อสัตย์']
  },
  {
    id: 'fish', thaiName: 'ปลา', englishName: 'Fish', category: 'animals',
    description: 'ฝันเห็นปลา โชคลาภ ทรัพย์สินเงินทอง',
    twoDigit: [56, 67, 16, 65, 76], threeDigit: [567, 676, 165, 657, 756], confidence: 74,
    tags: ['โชคลาภ', 'เงิน', 'น้ำ']
  },
  {
    id: 'big_fish', thaiName: 'ปลาใหญ่', englishName: 'Big Fish', category: 'animals',
    description: 'ฝันเห็นปลาใหญ่ โชคใหญ่ ลาภมาก',
    twoDigit: [56, 65, 5, 55, 50], threeDigit: [565, 655, 505, 556, 650], confidence: 80,
    tags: ['โชคใหญ่', 'ลาภมาก']
  },
  {
    id: 'bird', thaiName: 'นก', englishName: 'Bird', category: 'animals',
    description: 'ฝันเห็นนก หมายถึงข่าวดี โชคมาจากไกล',
    twoDigit: [14, 41, 4, 40, 44], threeDigit: [140, 410, 404, 414, 441], confidence: 63,
    tags: ['ข่าวดี', 'โชคมาจากไกล']
  },
  {
    id: 'crow', thaiName: 'อีกา/กา', englishName: 'Crow', category: 'animals',
    description: 'ฝันเห็นอีกา ระวัง แต่มีเลขดีซ่อนอยู่',
    twoDigit: [33, 99, 39, 93, 3], threeDigit: [339, 993, 393, 933, 399], confidence: 70,
    tags: ['ระวัง', 'เลขดี']
  },
  {
    id: 'chicken', thaiName: 'ไก่', englishName: 'Chicken', category: 'animals',
    description: 'ฝันเห็นไก่ หมายถึงความขยัน มีทรัพย์จากการทำงาน',
    twoDigit: [24, 42, 72, 27, 47], threeDigit: [240, 420, 724, 274, 472], confidence: 60,
    tags: ['ขยัน', 'ทรัพย์']
  },
  {
    id: 'pig', thaiName: 'หมู', englishName: 'Pig', category: 'animals',
    description: 'ฝันเห็นหมู โชคลาภ เงินทอง มักหมายถึงได้เงินก้อนใหญ่',
    twoDigit: [25, 52, 68, 86, 58], threeDigit: [250, 520, 680, 862, 586], confidence: 72,
    tags: ['เงินก้อนใหญ่', 'โชคลาภ']
  },
  {
    id: 'horse', thaiName: 'ม้า', englishName: 'Horse', category: 'animals',
    description: 'ฝันเห็นม้า หมายถึงความเร็ว ความก้าวหน้า โชคมาเร็ว',
    twoDigit: [35, 53, 85, 58, 15], threeDigit: [350, 530, 853, 585, 153], confidence: 67,
    tags: ['เร็ว', 'ก้าวหน้า']
  },
  {
    id: 'rabbit', thaiName: 'กระต่าย', englishName: 'Rabbit', category: 'animals',
    description: 'ฝันเห็นกระต่าย หมายถึงความโชคดี ความน่ารัก มีคนรัก',
    twoDigit: [10, 40, 19, 91, 14], threeDigit: [100, 400, 190, 914, 140], confidence: 65,
    tags: ['โชคดี', 'รัก']
  },
  {
    id: 'turtle', thaiName: 'เต่า', englishName: 'Turtle', category: 'animals',
    description: 'ฝันเห็นเต่า มงคล หมายถึงอายุยืน มั่นคง ทรัพย์สินคงทน',
    twoDigit: [15, 51, 55, 5, 50], threeDigit: [155, 510, 550, 505, 515], confidence: 70,
    tags: ['มงคล', 'อายุยืน', 'มั่นคง']
  },
  {
    id: 'crocodile', thaiName: 'จระเข้', englishName: 'Crocodile', category: 'animals',
    description: 'ฝันเห็นจระเข้ หมายถึงอันตราย แต่ก็มีโชคลาภซ่อนอยู่',
    twoDigit: [27, 72, 17, 71, 77], threeDigit: [270, 720, 177, 717, 772], confidence: 73,
    tags: ['อันตราย', 'โชคซ่อน']
  },
  {
    id: 'monkey', thaiName: 'ลิง', englishName: 'Monkey', category: 'animals',
    description: 'ฝันเห็นลิง หมายถึงความฉลาด มีเพื่อนช่วย',
    twoDigit: [46, 64, 16, 61, 46], threeDigit: [460, 640, 164, 614, 461], confidence: 60,
    tags: ['ฉลาด', 'เพื่อน']
  },
  {
    id: 'cow', thaiName: 'วัว/ควาย', englishName: 'Cow/Buffalo', category: 'animals',
    description: 'ฝันเห็นวัวหรือควาย หมายถึงความขยัน มีทรัพย์จากที่ดิน',
    twoDigit: [36, 63, 6, 60, 66], threeDigit: [360, 630, 606, 663, 366], confidence: 65,
    tags: ['ขยัน', 'ที่ดิน', 'ทรัพย์']
  },
  {
    id: 'rat', thaiName: 'หนู', englishName: 'Rat', category: 'animals',
    description: 'ฝันเห็นหนู หมายถึงความฉลาด มีเงินออม',
    twoDigit: [1, 51, 11, 10, 91], threeDigit: [510, 110, 109, 191, 151], confidence: 62,
    tags: ['ฉลาด', 'ออม']
  },

  // ======= คน PEOPLE =======
  {
    id: 'child', thaiName: 'เด็ก', englishName: 'Child', category: 'people',
    description: 'ฝันเห็นเด็ก หมายถึงความบริสุทธิ์ ข่าวดี ลาภมาจากเด็ก',
    twoDigit: [9, 19, 99, 90, 29], threeDigit: [190, 990, 909, 299, 919], confidence: 68,
    tags: ['ข่าวดี', 'ลาภ']
  },
  {
    id: 'elder', thaiName: 'คนแก่', englishName: 'Elder', category: 'people',
    description: 'ฝันเห็นคนแก่ หมายถึงได้รับคำแนะนำ มีที่พึ่ง',
    twoDigit: [0, 90, 70, 9, 79], threeDigit: [900, 700, 90, 709, 970], confidence: 65,
    tags: ['แนะนำ', 'ที่พึ่ง']
  },
  {
    id: 'monk', thaiName: 'พระสงฆ์', englishName: 'Monk', category: 'people',
    description: 'ฝันเห็นพระสงฆ์ มงคลยิ่ง สิ่งดีกำลังมา',
    twoDigit: [10, 40, 0, 100, 4], threeDigit: [100, 400, 40, 104, 401], confidence: 85,
    tags: ['มงคล', 'สิ่งดี']
  },
  {
    id: 'ghost', thaiName: 'ผี', englishName: 'Ghost', category: 'people',
    description: 'ฝันเห็นผี อย่ากลัว มักมีเลขมาให้',
    twoDigit: [33, 89, 93, 38, 83], threeDigit: [330, 893, 938, 380, 839], confidence: 78,
    tags: ['ผี', 'เลขให้']
  },
  {
    id: 'dead_person', thaiName: 'คนตาย', englishName: 'Dead Person', category: 'people',
    description: 'ฝันเห็นคนตาย ผู้วายชนม์อาจมาบอกเลข',
    twoDigit: [33, 89, 9, 93, 38], threeDigit: [330, 893, 909, 938, 389], confidence: 82,
    tags: ['คนตาย', 'เลขจากผู้วายชนม์']
  },
  {
    id: 'relative', thaiName: 'ญาติพี่น้อง', englishName: 'Relative', category: 'people',
    description: 'ฝันเห็นญาติ หมายถึงสายสัมพันธ์ ความช่วยเหลือ',
    twoDigit: [59, 95, 45, 54, 49], threeDigit: [590, 950, 459, 549, 495], confidence: 60,
    tags: ['ญาติ', 'ช่วยเหลือ']
  },

  // ======= ธรรมชาติ NATURE =======
  {
    id: 'fire', thaiName: 'ไฟ', englishName: 'Fire', category: 'nature',
    description: 'ฝันเห็นไฟ หมายถึงความร้อนแรง พลังงาน โชคมาเร็ว',
    twoDigit: [15, 51, 67, 17, 71], threeDigit: [150, 510, 671, 175, 517], confidence: 72,
    tags: ['ร้อน', 'พลัง', 'เร็ว']
  },
  {
    id: 'water', thaiName: 'น้ำ', englishName: 'Water', category: 'nature',
    description: 'ฝันเห็นน้ำ หมายถึงความไหลลื่น เงินทองไหลมา',
    twoDigit: [5, 55, 95, 50, 15], threeDigit: [505, 550, 955, 500, 155], confidence: 70,
    tags: ['ไหลลื่น', 'เงินทอง']
  },
  {
    id: 'flood', thaiName: 'น้ำท่วม', englishName: 'Flood', category: 'nature',
    description: 'ฝันเห็นน้ำท่วม เงินโชคท่วมมา',
    twoDigit: [5, 55, 15, 51, 95], threeDigit: [550, 155, 515, 955, 505], confidence: 75,
    tags: ['น้ำมาก', 'โชคมาก']
  },
  {
    id: 'sea', thaiName: 'ทะเล', englishName: 'Sea', category: 'nature',
    description: 'ฝันเห็นทะเล หมายถึงความกว้างใหญ่ โชคใหญ่',
    twoDigit: [5, 50, 55, 95, 59], threeDigit: [500, 550, 955, 595, 509], confidence: 68,
    tags: ['ใหญ่', 'กว้าง']
  },
  {
    id: 'river', thaiName: 'แม่น้ำ', englishName: 'River', category: 'nature',
    description: 'ฝันเห็นแม่น้ำ เงินทองไหลมาเรื่อยๆ',
    twoDigit: [5, 50, 55, 25, 52], threeDigit: [505, 500, 255, 552, 525], confidence: 65,
    tags: ['ไหล', 'เงินทอง']
  },
  {
    id: 'mountain', thaiName: 'ภูเขา', englishName: 'Mountain', category: 'nature',
    description: 'ฝันเห็นภูเขา หมายถึงความมั่นคง ความสำเร็จ',
    twoDigit: [7, 77, 70, 37, 73], threeDigit: [700, 770, 370, 737, 773], confidence: 63,
    tags: ['มั่นคง', 'สำเร็จ']
  },
  {
    id: 'sun', thaiName: 'ดวงอาทิตย์', englishName: 'Sun', category: 'nature',
    description: 'ฝันเห็นดวงอาทิตย์ สว่างไสว มีโชคใหญ่มาเยือน',
    twoDigit: [1, 11, 41, 14, 71], threeDigit: [100, 110, 411, 141, 714], confidence: 80,
    tags: ['สว่าง', 'โชคใหญ่']
  },
  {
    id: 'moon', thaiName: 'ดวงจันทร์', englishName: 'Moon', category: 'nature',
    description: 'ฝันเห็นดวงจันทร์ หมายถึงความงาม โชคจากผู้หญิง',
    twoDigit: [15, 50, 1, 51, 10], threeDigit: [150, 500, 101, 510, 105], confidence: 75,
    tags: ['งาม', 'โชค']
  },
  {
    id: 'full_moon', thaiName: 'พระจันทร์เต็มดวง', englishName: 'Full Moon', category: 'nature',
    description: 'ฝันเห็นพระจันทร์เต็มดวง โชคสมบูรณ์ ลาภมาก',
    twoDigit: [15, 50, 55, 5, 51], threeDigit: [155, 500, 555, 505, 515], confidence: 85,
    tags: ['สมบูรณ์', 'ลาภมาก']
  },
  {
    id: 'stars', thaiName: 'ดาว', englishName: 'Stars', category: 'nature',
    description: 'ฝันเห็นดาว หมายถึงความหวัง โชคดีรออยู่',
    twoDigit: [14, 41, 94, 49, 4], threeDigit: [140, 410, 941, 494, 414], confidence: 68,
    tags: ['ความหวัง', 'โชคดี']
  },
  {
    id: 'rainbow', thaiName: 'รุ้งกินน้ำ', englishName: 'Rainbow', category: 'nature',
    description: 'ฝันเห็นรุ้งกินน้ำ โชคมาพร้อมสีสัน',
    twoDigit: [7, 77, 7, 47, 74], threeDigit: [700, 770, 477, 747, 774], confidence: 78,
    tags: ['สีสัน', 'โชคสวยงาม']
  },
  {
    id: 'lightning', thaiName: 'สายฟ้า/ฟ้าแลบ', englishName: 'Lightning', category: 'nature',
    description: 'ฝันเห็นสายฟ้า โชคมาแบบฉับพลัน',
    twoDigit: [15, 51, 19, 91, 59], threeDigit: [150, 510, 191, 915, 591], confidence: 72,
    tags: ['ฉับพลัน', 'โชคเร็ว']
  },
  {
    id: 'flower', thaiName: 'ดอกไม้', englishName: 'Flower', category: 'nature',
    description: 'ฝันเห็นดอกไม้ หมายถึงความรัก ความสวยงาม โชคดี',
    twoDigit: [21, 71, 12, 17, 27], threeDigit: [210, 710, 127, 171, 271], confidence: 65,
    tags: ['ความรัก', 'สวยงาม']
  },
  {
    id: 'tree', thaiName: 'ต้นไม้ใหญ่', englishName: 'Big Tree', category: 'nature',
    description: 'ฝันเห็นต้นไม้ใหญ่ หมายถึงที่พึ่ง ความมั่นคง',
    twoDigit: [38, 83, 3, 30, 83], threeDigit: [380, 830, 303, 838, 383], confidence: 63,
    tags: ['ที่พึ่ง', 'มั่นคง']
  },

  // ======= สิ่งของ OBJECTS =======
  {
    id: 'gold', thaiName: 'ทอง/ทองคำ', englishName: 'Gold', category: 'objects',
    description: 'ฝันเห็นทองคำ โชคลาภมหาศาล',
    twoDigit: [6, 16, 66, 46, 64], threeDigit: [600, 166, 664, 466, 646], confidence: 88,
    tags: ['ทอง', 'ลาภมาก']
  },
  {
    id: 'money', thaiName: 'เงิน/ธนบัตร', englishName: 'Money', category: 'objects',
    description: 'ฝันเห็นเงินหรือธนบัตร โชคลาภ เงินทองมาเอง',
    twoDigit: [3, 53, 63, 13, 31], threeDigit: [300, 530, 631, 133, 313], confidence: 85,
    tags: ['เงิน', 'ลาภ']
  },
  {
    id: 'diamond', thaiName: 'เพชร/อัญมณี', englishName: 'Diamond/Gem', category: 'objects',
    description: 'ฝันเห็นเพชรพลอย โชคล้ำค่า สิ่งมีค่าจะมาถึง',
    twoDigit: [66, 6, 69, 96, 16], threeDigit: [660, 606, 699, 966, 166], confidence: 82,
    tags: ['ค่า', 'โชค']
  },
  {
    id: 'ring', thaiName: 'แหวน', englishName: 'Ring', category: 'objects',
    description: 'ฝันเห็นแหวน มีความรัก โชคดีในเรื่องความรัก',
    twoDigit: [66, 6, 9, 96, 69], threeDigit: [660, 690, 996, 969, 666], confidence: 70,
    tags: ['ความรัก', 'โชคดี']
  },
  {
    id: 'house', thaiName: 'บ้าน', englishName: 'House', category: 'objects',
    description: 'ฝันเห็นบ้าน หมายถึงความมั่นคง ครอบครัว',
    twoDigit: [7, 57, 77, 70, 17], threeDigit: [700, 570, 777, 707, 177], confidence: 65,
    tags: ['มั่นคง', 'ครอบครัว']
  },
  {
    id: 'car', thaiName: 'รถยนต์', englishName: 'Car', category: 'objects',
    description: 'ฝันเห็นรถยนต์ หมายถึงความก้าวหน้า เดินทางโชคดี',
    twoDigit: [4, 14, 44, 40, 34], threeDigit: [400, 144, 440, 404, 344], confidence: 63,
    tags: ['ก้าวหน้า', 'เดินทาง']
  },
  {
    id: 'boat', thaiName: 'เรือ', englishName: 'Boat', category: 'objects',
    description: 'ฝันเห็นเรือ หมายถึงการเดินทาง โชคจากต่างถิ่น',
    twoDigit: [34, 43, 4, 40, 43], threeDigit: [340, 430, 404, 403, 434], confidence: 62,
    tags: ['เดินทาง', 'ต่างถิ่น']
  },
  {
    id: 'lottery', thaiName: 'ลอตเตอรี่/สลาก', englishName: 'Lottery Ticket', category: 'objects',
    description: 'ฝันเห็นสลากหรือลอตเตอรี่ โชคใหญ่กำลังมาแน่นอน!',
    twoDigit: [1, 6, 16, 61, 99], threeDigit: [100, 600, 166, 616, 999], confidence: 95,
    tags: ['โชคใหญ่', 'แน่นอน']
  },
  {
    id: 'clock', thaiName: 'นาฬิกา', englishName: 'Clock', category: 'objects',
    description: 'ฝันเห็นนาฬิกา หมายถึงเวลา โชคดีตามเวลา',
    twoDigit: [12, 6, 3, 9, 61], threeDigit: [120, 600, 300, 900, 612], confidence: 58,
    tags: ['เวลา', 'โชคดี']
  },
  {
    id: 'knife', thaiName: 'มีด/อาวุธ', englishName: 'Knife/Weapon', category: 'objects',
    description: 'ฝันเห็นมีด ระวังภัย แต่ก็ชนะอุปสรรค',
    twoDigit: [53, 35, 5, 58, 85], threeDigit: [530, 350, 505, 580, 853], confidence: 67,
    tags: ['ระวัง', 'ชนะ']
  },

  // ======= สถานที่ PLACES =======
  {
    id: 'temple', thaiName: 'วัด', englishName: 'Temple', category: 'places',
    description: 'ฝันเห็นวัด มงคลมาก บุญส่งผล',
    twoDigit: [10, 40, 0, 1, 4], threeDigit: [100, 400, 10, 104, 401], confidence: 80,
    tags: ['มงคล', 'บุญ']
  },
  {
    id: 'market', thaiName: 'ตลาด', englishName: 'Market', category: 'places',
    description: 'ฝันเห็นตลาด หมายถึงการค้าขายดี มีเงิน',
    twoDigit: [23, 32, 3, 30, 83], threeDigit: [230, 320, 303, 323, 832], confidence: 62,
    tags: ['ค้าขาย', 'เงิน']
  },
  {
    id: 'palace', thaiName: 'วัง/พระราชวัง', englishName: 'Palace', category: 'places',
    description: 'ฝันเห็นพระราชวัง หมายถึงอำนาจ เกียรติยศ โชคใหญ่',
    twoDigit: [1, 6, 16, 61, 91], threeDigit: [100, 600, 166, 616, 916], confidence: 78,
    tags: ['อำนาจ', 'เกียรติ']
  },
  {
    id: 'forest', thaiName: 'ป่า', englishName: 'Forest', category: 'places',
    description: 'ฝันเห็นป่า หมายถึงสิ่งซ่อนเร้น โชคจากธรรมชาติ',
    twoDigit: [38, 83, 3, 8, 83], threeDigit: [380, 830, 308, 838, 388], confidence: 60,
    tags: ['ซ่อนเร้น', 'ธรรมชาติ']
  },

  // ======= กิจกรรม ACTIVITIES =======
  {
    id: 'flying', thaiName: 'บิน/ฝันบิน', englishName: 'Flying Dream', category: 'activities',
    description: 'ฝันบิน หมายถึงอิสรภาพ โชคดี ความสำเร็จ',
    twoDigit: [14, 41, 4, 74, 47], threeDigit: [140, 410, 404, 744, 474], confidence: 80,
    tags: ['อิสระ', 'สำเร็จ']
  },
  {
    id: 'falling_water', thaiName: 'ตกน้ำ', englishName: 'Falling in Water', category: 'activities',
    description: 'ฝันตกน้ำ หมายถึงปัญหาผ่านไป โชคลาภตามมา',
    twoDigit: [5, 55, 95, 59, 15], threeDigit: [505, 550, 955, 595, 155], confidence: 68,
    tags: ['ผ่านปัญหา', 'โชคตามมา']
  },
  {
    id: 'chased', thaiName: 'ถูกไล่/ถูกไล่ล่า', englishName: 'Being Chased', category: 'activities',
    description: 'ฝันว่าถูกไล่ อุปสรรคกำลังผ่าน โชคตาม',
    twoDigit: [89, 98, 9, 8, 98], threeDigit: [890, 980, 909, 808, 989], confidence: 70,
    tags: ['อุปสรรค', 'ผ่าน']
  },
  {
    id: 'winning', thaiName: 'ชนะ/ได้รางวัล', englishName: 'Winning', category: 'activities',
    description: 'ฝันว่าชนะหรือได้รางวัล โชคมาจริง!',
    twoDigit: [1, 6, 9, 99, 19], threeDigit: [100, 600, 900, 999, 196], confidence: 92,
    tags: ['ชนะ', 'โชคแน่']
  },
  {
    id: 'fire_disaster', thaiName: 'ไฟไหม้', englishName: 'Fire/Burning', category: 'activities',
    description: 'ฝันเห็นไฟไหม้ หมายถึงการเปลี่ยนแปลง โชคใหม่กำลังมา',
    twoDigit: [15, 51, 17, 71, 57], threeDigit: [150, 510, 175, 715, 571], confidence: 72,
    tags: ['เปลี่ยนแปลง', 'ใหม่']
  },
  {
    id: 'funeral', thaiName: 'งานศพ', englishName: 'Funeral', category: 'activities',
    description: 'ฝันเห็นงานศพ มีเลขดีจากคนวายชนม์',
    twoDigit: [33, 89, 93, 38, 9], threeDigit: [330, 893, 939, 389, 909], confidence: 82,
    tags: ['เลขดี', 'ผู้วายชนม์']
  },
  {
    id: 'wedding', thaiName: 'งานแต่งงาน', englishName: 'Wedding', category: 'activities',
    description: 'ฝันเห็นงานแต่ง หมายถึงความสุข โชคดี ลาภมาก',
    twoDigit: [9, 19, 99, 91, 29], threeDigit: [900, 190, 999, 919, 299], confidence: 75,
    tags: ['ความสุข', 'ลาภ']
  },

  // ======= เหนือธรรมชาติ SUPERNATURAL =======
  {
    id: 'deity', thaiName: 'เทวดา/นางฟ้า', englishName: 'Deity/Angel', category: 'supernatural',
    description: 'ฝันเห็นเทวดา โชคมาจากฟ้า มีผู้คุ้มครอง',
    twoDigit: [1, 14, 41, 11, 4], threeDigit: [100, 140, 410, 110, 414], confidence: 88,
    tags: ['มงคล', 'คุ้มครอง']
  },
  {
    id: 'dragon', thaiName: 'มังกร', englishName: 'Dragon', category: 'supernatural',
    description: 'ฝันเห็นมังกร หมายถึงอำนาจ โชคใหญ่ มั่งคั่ง',
    twoDigit: [5, 55, 5, 75, 57], threeDigit: [505, 550, 755, 575, 557], confidence: 85,
    tags: ['อำนาจ', 'โชคใหญ่']
  },
  {
    id: 'spirit_house', thaiName: 'ศาลพระภูมิ/เจ้าที่', englishName: 'Spirit House', category: 'supernatural',
    description: 'ฝันเห็นเจ้าที่ หมายถึงสิ่งศักดิ์สิทธิ์ช่วย',
    twoDigit: [33, 43, 3, 34, 13], threeDigit: [330, 430, 343, 134, 433], confidence: 80,
    tags: ['ศักดิ์สิทธิ์', 'ช่วยเหลือ']
  },

  // ======= สี COLORS =======
  {
    id: 'red', thaiName: 'สีแดง', englishName: 'Red Color', category: 'colors',
    description: 'ฝันเห็นสีแดง หมายถึงพลังงาน โชคแรง',
    twoDigit: [1, 19, 91, 17, 71], threeDigit: [100, 190, 910, 171, 719], confidence: 65,
    tags: ['พลัง', 'โชคแรง']
  },
  {
    id: 'gold_color', thaiName: 'สีทอง', englishName: 'Gold Color', category: 'colors',
    description: 'ฝันเห็นสีทอง โชคลาภ เงินทองไหลมา',
    twoDigit: [6, 16, 66, 46, 64], threeDigit: [600, 166, 664, 466, 646], confidence: 82,
    tags: ['ทอง', 'ลาภ']
  },
  {
    id: 'white', thaiName: 'สีขาว', englishName: 'White Color', category: 'colors',
    description: 'ฝันเห็นสีขาว หมายถึงความบริสุทธิ์ ความดีมาเยือน',
    twoDigit: [0, 10, 100, 1, 90], threeDigit: [0, 100, 10, 110, 901], confidence: 65,
    tags: ['บริสุทธิ์', 'ดี']
  },
]

export const categoryLabels: Record<string, string> = {
  animals: '🐾 สัตว์',
  people: '👤 คน',
  nature: '🌿 ธรรมชาติ',
  objects: '💎 สิ่งของ',
  places: '🏛️ สถานที่',
  activities: '⚡ กิจกรรม',
  supernatural: '✨ เหนือธรรมชาติ',
  colors: '🎨 สี',
}
