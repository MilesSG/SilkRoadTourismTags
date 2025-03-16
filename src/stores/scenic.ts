import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getDefaultImagesForSpot } from '../utils/imageValidator'

// 景点标签类型定义
export interface Tag {
  id: string;
  name: string;
  category: string; // 标签分类：地理特征、历史文化、时节、价格、活动类型等
  color?: string; // 标签显示颜色
}

// 景点类型定义
export interface ScenicSpot {
  id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    province: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  images: string[]; // 图片URL数组
  tags: string[]; // 标签ID数组
  price: {
    adult: number;
    child?: number;
    student?: number;
  };
  openingHours: {
    open: string; // 开放时间，如 "08:00"
    close: string; // 关闭时间，如 "18:00"
    holidayAdjustment?: string; // 节假日调整说明
  };
  bestVisitSeason: string[]; // 最佳游览季节，如 ["春", "秋"]
  rating: number; // 评分，1-5分
  visitDuration: string; // 建议游览时长，如 "2小时"
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
}

export const useScenicStore = defineStore('scenic', () => {
  // 数据状态
  const scenicSpots = ref<ScenicSpot[]>([])
  const tags = ref<Tag[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // 计算属性
  const tagMap = computed(() => {
    const map = new Map<string, Tag>()
    tags.value.forEach(tag => {
      map.set(tag.id, tag)
    })
    return map
  })
  
  // 按分类组织标签
  const tagsByCategory = computed(() => {
    const categories = new Map<string, Tag[]>()
    
    tags.value.forEach(tag => {
      if (!categories.has(tag.category)) {
        categories.set(tag.category, [])
      }
      categories.get(tag.category)?.push(tag)
    })
    
    return Array.from(categories.entries()).map(([category, tags]) => ({
      category,
      tags: tags.sort((a, b) => a.name.localeCompare(b.name))
    }))
  })
  
  // 加载景点数据
  async function loadScenicSpots() {
    isLoading.value = true
    error.value = null
    
    try {
      console.log('开始加载景点数据')
      
      // 直接使用硬编码的景点数据，确保数据始终可用
      scenicSpots.value = [
        {
          "id": "scenic-001",
          "name": "敦煌莫高窟",
          "description": "莫高窟，俗称千佛洞，是世界上现存规模最大、内容最丰富的佛教艺术圣地，也是丝绸之路上最璀璨的文化明珠。",
          "location": {
            "address": "甘肃省酒泉市敦煌市莫高窟",
            "city": "敦煌",
            "province": "甘肃",
            "country": "中国",
            "coordinates": {
              "lat": 40.0359,
              "lng": 94.8053
            }
          },
          "images": [], // 移除图片URL，使用渐变色背景
          "tags": ["type-historical", "type-cultural", "geo-desert"],
          "price": {
            "adult": 258,
            "child": 129,
            "student": 129
          },
          "openingHours": {
            "open": "08:00",
            "close": "18:00"
          },
          "bestVisitSeason": ["春", "秋"],
          "rating": 4.9,
          "visitDuration": "4小时",
          "createdAt": "2023-01-01T00:00:00Z",
          "updatedAt": "2023-01-01T00:00:00Z"
        },
        {
          "id": "scenic-002",
          "name": "嘉峪关",
          "description": "嘉峪关是明长城西端的第一重关隘，也是古代丝绸之路的重要门户，素有'天下第一雄关'之称。",
          "location": {
            "address": "甘肃省嘉峪关市嘉峪关关城",
            "city": "嘉峪关",
            "province": "甘肃",
            "country": "中国",
            "coordinates": {
              "lat": 39.8716,
              "lng": 98.2436
            }
          },
          "images": getDefaultImagesForSpot("嘉峪关", ["type-historical", "geo-mountain"]),
          "tags": ["type-historical", "geo-mountain"],
          "price": {
            "adult": 120,
            "child": 60,
            "student": 60
          },
          "openingHours": {
            "open": "08:30",
            "close": "18:30"
          },
          "bestVisitSeason": ["春", "夏", "秋"],
          "rating": 4.7,
          "visitDuration": "3小时",
          "createdAt": "2023-01-02T00:00:00Z",
          "updatedAt": "2023-01-02T00:00:00Z"
        },
        {
          "id": "scenic-003",
          "name": "吐鲁番葡萄沟",
          "description": "吐鲁番葡萄沟是新疆最著名的葡萄产区，以其甜美的葡萄而闻名，同时也是了解维吾尔族风情的绝佳去处。",
          "location": {
            "address": "新疆维吾尔自治区吐鲁番市高昌区葡萄沟景区",
            "city": "吐鲁番",
            "province": "新疆",
            "country": "中国",
            "coordinates": {
              "lat": 42.9547,
              "lng": 89.1770
            }
          },
          "images": getDefaultImagesForSpot("吐鲁番葡萄沟", ["type-natural", "activity-sightseeing", "culture-food"]),
          "tags": ["type-natural", "activity-sightseeing", "culture-food"],
          "price": {
            "adult": 60,
            "child": 30,
            "student": 30
          },
          "openingHours": {
            "open": "09:00",
            "close": "19:00"
          },
          "bestVisitSeason": ["夏", "秋"],
          "rating": 4.5,
          "visitDuration": "2小时",
          "createdAt": "2023-01-03T00:00:00Z",
          "updatedAt": "2023-01-03T00:00:00Z"
        },
        {
          "id": "scenic-004",
          "name": "交河故城",
          "description": "交河故城是世界上最大最古老、保存最完好的生土建筑城市，被誉为'沙漠中的明珠'。",
          "location": {
            "address": "新疆维吾尔自治区吐鲁番市高昌区交河故城景区",
            "city": "吐鲁番",
            "province": "新疆",
            "country": "中国",
            "coordinates": {
              "lat": 42.9581,
              "lng": 89.0419
            }
          },
          "images": getDefaultImagesForSpot("交河故城", ["type-historical", "type-cultural", "geo-desert"]),
          "tags": ["type-historical", "type-cultural", "geo-desert"],
          "price": {
            "adult": 75,
            "child": 38,
            "student": 38
          },
          "openingHours": {
            "open": "09:30",
            "close": "19:30"
          },
          "bestVisitSeason": ["春", "秋"],
          "rating": 4.6,
          "visitDuration": "3小时",
          "createdAt": "2023-01-04T00:00:00Z",
          "updatedAt": "2023-01-04T00:00:00Z"
        },
        {
          "id": "scenic-005",
          "name": "喀什老城",
          "description": "喀什老城，即高台民居，是维吾尔族传统民居建筑的代表，迷宫般的街道和土黄色的房屋充满异域风情。",
          "location": {
            "address": "新疆维吾尔自治区喀什地区喀什市老城区",
            "city": "喀什",
            "province": "新疆",
            "country": "中国",
            "coordinates": {
              "lat": 39.4704,
              "lng": 75.9893
            }
          },
          "images": getDefaultImagesForSpot("喀什老城", ["type-cultural", "culture-architecture", "activity-photography"]),
          "tags": ["type-cultural", "culture-architecture", "activity-photography"],
          "price": {
            "adult": 45,
            "child": 25,
            "student": 25
          },
          "openingHours": {
            "open": "全天开放",
            "close": "全天开放"
          },
          "bestVisitSeason": ["春", "夏", "秋"],
          "rating": 4.7,
          "visitDuration": "3小时",
          "createdAt": "2023-01-05T00:00:00Z",
          "updatedAt": "2023-01-05T00:00:00Z"
        },
        {
          "id": "scenic-006",
          "name": "艾提尕尔清真寺",
          "description": "艾提尕尔清真寺是中国最大的清真寺之一，具有浓郁的伊斯兰风格，是丝绸之路上重要的宗教文化遗产。",
          "location": {
            "address": "新疆维吾尔自治区喀什地区喀什市艾提尕尔广场",
            "city": "喀什",
            "province": "新疆",
            "country": "中国",
            "coordinates": {
              "lat": 39.4738,
              "lng": 75.9856
            }
          },
          "images": getDefaultImagesForSpot("艾提尕尔清真寺", ["type-cultural", "type-religious", "culture-architecture"]),
          "tags": ["type-cultural", "type-religious", "culture-architecture"],
          "price": {
            "adult": 30,
            "child": 15,
            "student": 15
          },
          "openingHours": {
            "open": "10:00",
            "close": "18:00",
            "holidayAdjustment": "周五礼拜时段不对外开放"
          },
          "bestVisitSeason": ["春", "秋"],
          "rating": 4.6,
          "visitDuration": "1.5小时",
          "createdAt": "2023-01-06T00:00:00Z",
          "updatedAt": "2023-01-06T00:00:00Z"
        },
        {
          "id": "scenic-007",
          "name": "天山天池",
          "description": "天山天池是新疆著名的高山湖泊，湖水清澈碧蓝，周围雪山环绕，景色壮丽如画。",
          "location": {
            "address": "新疆维吾尔自治区昌吉回族自治州阜康市天山天池景区",
            "city": "阜康",
            "province": "新疆",
            "country": "中国",
            "coordinates": {
              "lat": 43.8883,
              "lng": 88.1147
            }
          },
          "images": getDefaultImagesForSpot("天山天池", ["type-natural", "geo-mountain", "geo-lake"]),
          "tags": ["type-natural", "geo-mountain", "geo-lake"],
          "price": {
            "adult": 115,
            "child": 58,
            "student": 58
          },
          "openingHours": {
            "open": "09:00",
            "close": "18:00"
          },
          "bestVisitSeason": ["夏", "秋"],
          "rating": 4.8,
          "visitDuration": "4小时",
          "createdAt": "2023-01-07T00:00:00Z",
          "updatedAt": "2023-01-07T00:00:00Z"
        },
        {
          "id": "scenic-008",
          "name": "楼兰古城遗址",
          "description": "楼兰古城是古代丝绸之路上的重要城邦，因神秘消失而闻名于世，如今只剩下荒漠中的遗址。",
          "location": {
            "address": "新疆维吾尔自治区巴音郭楞蒙古自治州若羌县楼兰遗址",
            "city": "若羌",
            "province": "新疆",
            "country": "中国",
            "coordinates": {
              "lat": 40.5102,
              "lng": 89.7889
            }
          },
          "images": getDefaultImagesForSpot("楼兰古城遗址", ["type-historical", "type-adventure", "geo-desert"]),
          "tags": ["type-historical", "type-adventure", "geo-desert"],
          "price": {
            "adult": 160,
            "child": 80,
            "student": 80
          },
          "openingHours": {
            "open": "09:00",
            "close": "17:00"
          },
          "bestVisitSeason": ["春", "秋"],
          "rating": 4.5,
          "visitDuration": "5小时",
          "createdAt": "2023-01-08T00:00:00Z",
          "updatedAt": "2023-01-08T00:00:00Z"
        },
        {
          "id": "scenic-009",
          "name": "克孜尔千佛洞",
          "description": "克孜尔千佛洞是我国开凿最早的大型石窟群之一，壁画艺术精湛，是研究古代龟兹文化的重要遗址。",
          "location": {
            "address": "新疆维吾尔自治区阿克苏地区拜城县克孜尔乡",
            "city": "拜城",
            "province": "新疆",
            "country": "中国",
            "coordinates": {
              "lat": 41.7811,
              "lng": 82.5478
            }
          },
          "images": getDefaultImagesForSpot("克孜尔千佛洞", ["type-historical", "type-cultural", "type-religious"]),
          "tags": ["type-historical", "type-cultural", "type-religious"],
          "price": {
            "adult": 70,
            "child": 35,
            "student": 35
          },
          "openingHours": {
            "open": "10:00",
            "close": "18:00"
          },
          "bestVisitSeason": ["春", "秋"],
          "rating": 4.6,
          "visitDuration": "3小时",
          "createdAt": "2023-01-09T00:00:00Z",
          "updatedAt": "2023-01-09T00:00:00Z"
        },
        {
          "id": "scenic-010",
          "name": "塔克拉玛干沙漠",
          "description": "塔克拉玛干是中国最大的沙漠，也是世界第二大流动沙漠，被称为'死亡之海'，但也是体验沙漠探险的绝佳之地。",
          "location": {
            "address": "新疆维吾尔自治区塔里木盆地中心",
            "city": "和田",
            "province": "新疆",
            "country": "中国",
            "coordinates": {
              "lat": 38.8233,
              "lng": 83.6023
            }
          },
          "images": getDefaultImagesForSpot("塔克拉玛干沙漠", ["type-adventure", "geo-desert", "activity-exploration"]),
          "tags": ["type-adventure", "geo-desert", "activity-exploration"],
          "price": {
            "adult": 180,
            "child": 90,
            "student": 90
          },
          "openingHours": {
            "open": "全天开放",
            "close": "全天开放"
          },
          "bestVisitSeason": ["春", "秋"],
          "rating": 4.8,
          "visitDuration": "1天",
          "createdAt": "2023-01-10T00:00:00Z",
          "updatedAt": "2023-01-10T00:00:00Z"
        },
        {
          "id": "scenic-011",
          "name": "兰州黄河风情线",
          "description": "黄河风情线是兰州市区沿黄河南岸修建的景观带，包括黄河母亲雕像、水车园等景点，展现了黄河文化。",
          "location": {
            "address": "甘肃省兰州市城关区滨河路",
            "city": "兰州",
            "province": "甘肃",
            "country": "中国",
            "coordinates": {
              "lat": 36.0580,
              "lng": 103.8190
            }
          },
          "images": getDefaultImagesForSpot("兰州黄河风情线", ["type-cultural", "geo-river", "activity-sightseeing"]),
          "tags": ["type-cultural", "geo-river", "activity-sightseeing"],
          "price": {
            "adult": 0,
            "child": 0,
            "student": 0
          },
          "openingHours": {
            "open": "全天开放",
            "close": "全天开放"
          },
          "bestVisitSeason": ["春", "夏", "秋"],
          "rating": 4.5,
          "visitDuration": "3小时",
          "createdAt": "2023-01-11T00:00:00Z",
          "updatedAt": "2023-01-11T00:00:00Z"
        },
        {
          "id": "scenic-012",
          "name": "麦积山石窟",
          "description": "麦积山石窟是中国四大石窟之一，以精美的泥塑艺术著称，被誉为'东方雕塑馆'。",
          "location": {
            "address": "甘肃省天水市麦积区麦积山风景区",
            "city": "天水",
            "province": "甘肃",
            "country": "中国",
            "coordinates": {
              "lat": 34.5691,
              "lng": 105.8800
            }
          },
          "images": getDefaultImagesForSpot("麦积山石窟", ["type-historical", "type-cultural", "type-religious"]),
          "tags": ["type-historical", "type-cultural", "type-religious"],
          "price": {
            "adult": 90,
            "child": 45,
            "student": 45
          },
          "openingHours": {
            "open": "08:00",
            "close": "18:00"
          },
          "bestVisitSeason": ["春", "秋"],
          "rating": 4.7,
          "visitDuration": "4小时",
          "createdAt": "2023-01-12T00:00:00Z",
          "updatedAt": "2023-01-12T00:00:00Z"
        },
        {
          "id": "scenic-013",
          "name": "河西走廊",
          "description": "河西走廊是古丝绸之路的咽喉要道，两侧是巍峨的祁连山和北山，中间是狭长的走廊平原，自然风光和历史遗迹丰富。",
          "location": {
            "address": "甘肃省河西地区（武威、张掖、酒泉、嘉峪关、敦煌）",
            "city": "张掖",
            "province": "甘肃",
            "country": "中国",
            "coordinates": {
              "lat": 38.9325,
              "lng": 100.4516
            }
          },
          "images": getDefaultImagesForSpot("河西走廊", ["type-natural", "type-historical", "geo-mountain", "activity-roadtrip"]),
          "tags": ["type-natural", "type-historical", "geo-mountain", "activity-roadtrip"],
          "price": {
            "adult": 0,
            "child": 0,
            "student": 0
          },
          "openingHours": {
            "open": "全天开放",
            "close": "全天开放"
          },
          "bestVisitSeason": ["春", "夏", "秋"],
          "rating": 4.9,
          "visitDuration": "3-7天",
          "createdAt": "2023-01-13T00:00:00Z",
          "updatedAt": "2023-01-13T00:00:00Z"
        },
        {
          "id": "scenic-014",
          "name": "张掖丹霞地貌",
          "description": "张掖丹霞地貌以色彩斑斓、层理清晰著称，被誉为'中国最美的七大丹霞地貌之一'，宛如彩虹般的山丘令人惊叹。",
          "location": {
            "address": "甘肃省张掖市临泽县倪家营乡",
            "city": "张掖",
            "province": "甘肃",
            "country": "中国",
            "coordinates": {
              "lat": 38.9456,
              "lng": 100.4419
            }
          },
          "images": getDefaultImagesForSpot("张掖丹霞地貌", ["type-natural", "geo-mountain", "activity-photography"]),
          "tags": ["type-natural", "geo-mountain", "activity-photography"],
          "price": {
            "adult": 74,
            "child": 37,
            "student": 37
          },
          "openingHours": {
            "open": "08:00",
            "close": "18:30"
          },
          "bestVisitSeason": ["春", "夏", "秋"],
          "rating": 4.9,
          "visitDuration": "3小时",
          "createdAt": "2023-01-14T00:00:00Z",
          "updatedAt": "2023-01-14T00:00:00Z"
        },
        {
          "id": "scenic-015",
          "name": "西安兵马俑",
          "description": "秦始皇兵马俑是世界文化遗产，被誉为'世界第八大奇迹'，是中国古代辉煌文明的见证。",
          "location": {
            "address": "陕西省西安市临潼区秦始皇陵以东1.5公里处",
            "city": "西安",
            "province": "陕西",
            "country": "中国",
            "coordinates": {
              "lat": 34.3841,
              "lng": 109.2785
            }
          },
          "images": getDefaultImagesForSpot("西安兵马俑", ["type-historical", "type-cultural", "culture-archaeology"]),
          "tags": ["type-historical", "type-cultural", "culture-archaeology"],
          "price": {
            "adult": 150,
            "child": 75,
            "student": 75
          },
          "openingHours": {
            "open": "08:30",
            "close": "17:30"
          },
          "bestVisitSeason": ["春", "秋"],
          "rating": 5.0,
          "visitDuration": "4小时",
          "createdAt": "2023-01-15T00:00:00Z",
          "updatedAt": "2023-01-15T00:00:00Z"
        },
        {
          "id": "scenic-016",
          "name": "西安古城墙",
          "description": "西安城墙是中国现存规模最大、保存最完整的古代城垣，登上城墙可俯瞰古都风貌。",
          "location": {
            "address": "陕西省西安市城墙区环城南路",
            "city": "西安",
            "province": "陕西",
            "country": "中国",
            "coordinates": {
              "lat": 34.2580,
              "lng": 108.9389
            }
          },
          "images": getDefaultImagesForSpot("西安古城墙", ["type-historical", "type-cultural", "culture-architecture"]),
          "tags": ["type-historical", "type-cultural", "culture-architecture"],
          "price": {
            "adult": 54,
            "child": 27,
            "student": 27
          },
          "openingHours": {
            "open": "08:00",
            "close": "22:00"
          },
          "bestVisitSeason": ["春", "秋"],
          "rating": 4.7,
          "visitDuration": "3小时",
          "createdAt": "2023-01-16T00:00:00Z",
          "updatedAt": "2023-01-16T00:00:00Z"
        },
        {
          "id": "scenic-017",
          "name": "西安大雁塔",
          "description": "大雁塔是唐代著名的佛教建筑，是玄奘法师为保存从印度取回的经卷而建造的，也是丝绸之路佛教东传的象征。",
          "location": {
            "address": "陕西省西安市雁塔区雁塔南路",
            "city": "西安",
            "province": "陕西",
            "country": "中国",
            "coordinates": {
              "lat": 34.2224,
              "lng": 108.9564
            }
          },
          "images": getDefaultImagesForSpot("西安大雁塔", ["type-historical", "type-religious", "culture-architecture"]),
          "tags": ["type-historical", "type-religious", "culture-architecture"],
          "price": {
            "adult": 50,
            "child": 25,
            "student": 25
          },
          "openingHours": {
            "open": "08:00",
            "close": "17:00"
          },
          "bestVisitSeason": ["春", "秋"],
          "rating": 4.6,
          "visitDuration": "2小时",
          "createdAt": "2023-01-17T00:00:00Z",
          "updatedAt": "2023-01-17T00:00:00Z"
        },
        {
          "id": "scenic-018",
          "name": "华山",
          "description": "华山是中国五岳之一，以险峻著称，被誉为'天下第一险山'，登顶可俯瞰黄河流域的壮丽风光。",
          "location": {
            "address": "陕西省渭南市华阴市华山景区",
            "city": "华阴",
            "province": "陕西",
            "country": "中国",
            "coordinates": {
              "lat": 34.4939,
              "lng": 110.0890
            }
          },
          "images": getDefaultImagesForSpot("华山", ["type-natural", "type-adventure", "geo-mountain", "activity-hiking"]),
          "tags": ["type-natural", "type-adventure", "geo-mountain", "activity-hiking"],
          "price": {
            "adult": 180,
            "child": 90,
            "student": 90
          },
          "openingHours": {
            "open": "07:00",
            "close": "19:00"
          },
          "bestVisitSeason": ["春", "秋"],
          "rating": 4.9,
          "visitDuration": "1天",
          "createdAt": "2023-01-18T00:00:00Z",
          "updatedAt": "2023-01-18T00:00:00Z"
        },
        {
          "id": "scenic-019",
          "name": "丝绸之路国际博物馆",
          "description": "该博物馆全面展示了古代丝绸之路的历史、文化和艺术，收藏了大量与丝路相关的珍贵文物。",
          "location": {
            "address": "陕西省西安市新城区东新街360号",
            "city": "西安",
            "province": "陕西",
            "country": "中国",
            "coordinates": {
              "lat": 34.2654,
              "lng": 108.9454
            }
          },
          "images": getDefaultImagesForSpot("丝绸之路国际博物馆", ["type-cultural", "culture-museum", "type-educational"]),
          "tags": ["type-cultural", "culture-museum", "type-educational"],
          "price": {
            "adult": 60,
            "child": 30,
            "student": 30
          },
          "openingHours": {
            "open": "09:00",
            "close": "17:00",
            "holidayAdjustment": "周一闭馆"
          },
          "bestVisitSeason": ["全年"],
          "rating": 4.7,
          "visitDuration": "3小时",
          "createdAt": "2023-01-19T00:00:00Z",
          "updatedAt": "2023-01-19T00:00:00Z"
        },
        {
          "id": "scenic-020",
          "name": "龟兹古城",
          "description": "龟兹古城是古代西域三十六国之一，是丝绸之路上的重要文化中心，以其丰富的佛教艺术而闻名。",
          "location": {
            "address": "新疆维吾尔自治区阿克苏地区库车县库车镇",
            "city": "库车",
            "province": "新疆",
            "country": "中国",
            "coordinates": {
              "lat": 41.7178,
              "lng": 82.9580
            }
          },
          "images": getDefaultImagesForSpot("龟兹古城", ["type-historical", "type-cultural", "culture-archaeology"]),
          "tags": ["type-historical", "type-cultural", "culture-archaeology"],
          "price": {
            "adult": 40,
            "child": 20,
            "student": 20
          },
          "openingHours": {
            "open": "09:30",
            "close": "18:30"
          },
          "bestVisitSeason": ["春", "秋"],
          "rating": 4.5,
          "visitDuration": "3小时",
          "createdAt": "2023-01-20T00:00:00Z",
          "updatedAt": "2023-01-20T00:00:00Z"
        },
        {
          "id": "scenic-021",
          "name": "布达拉宫",
          "description": "布达拉宫是世界上海拔最高、规模最大的宫殿式建筑群，是藏传佛教的圣地和西藏的象征。",
          "location": {
            "address": "西藏自治区拉萨市城关区北京中路35号",
            "city": "拉萨",
            "province": "西藏",
            "country": "中国",
            "coordinates": {
              "lat": 29.6554,
              "lng": 91.1175
            }
          },
          "images": getDefaultImagesForSpot("布达拉宫", ["type-historical", "type-religious", "culture-architecture"]),
          "tags": ["type-historical", "type-religious", "culture-architecture"],
          "price": {
            "adult": 200,
            "child": 100,
            "student": 100
          },
          "openingHours": {
            "open": "09:00",
            "close": "16:00"
          },
          "bestVisitSeason": ["夏", "秋"],
          "rating": 4.9,
          "visitDuration": "3小时",
          "createdAt": "2023-01-21T00:00:00Z",
          "updatedAt": "2023-01-21T00:00:00Z"
        },
        {
          "id": "scenic-022",
          "name": "甘南草原",
          "description": "甘南草原是中国三大草原之一，这里有纯净的蓝天、辽阔的草场和丰富的藏族文化，被誉为'东方小瑞士'。",
          "location": {
            "address": "甘肃省甘南藏族自治州",
            "city": "合作",
            "province": "甘肃",
            "country": "中国",
            "coordinates": {
              "lat": 34.9869,
              "lng": 102.9112
            }
          },
          "images": getDefaultImagesForSpot("甘南草原", ["type-natural", "geo-grassland", "culture-ethnic"]),
          "tags": ["type-natural", "geo-grassland", "culture-ethnic"],
          "price": {
            "adult": 0,
            "child": 0,
            "student": 0
          },
          "openingHours": {
            "open": "全天开放",
            "close": "全天开放"
          },
          "bestVisitSeason": ["夏", "秋"],
          "rating": 4.8,
          "visitDuration": "2-3天",
          "createdAt": "2023-01-22T00:00:00Z",
          "updatedAt": "2023-01-22T00:00:00Z"
        },
        {
          "id": "scenic-023",
          "name": "拉卜楞寺",
          "description": "拉卜楞寺是我国藏传佛教格鲁派六大寺院之一，是世界上最大的藏传佛学院，也是研究藏传佛教的重要场所。",
          "location": {
            "address": "甘肃省甘南藏族自治州夏河县拉卜楞镇",
            "city": "夏河",
            "province": "甘肃",
            "country": "中国",
            "coordinates": {
              "lat": 35.1933,
              "lng": 102.5083
            }
          },
          "images": getDefaultImagesForSpot("拉卜楞寺", ["type-religious", "type-cultural", "culture-ethnic"]),
          "tags": ["type-religious", "type-cultural", "culture-ethnic"],
          "price": {
            "adult": 70,
            "child": 35,
            "student": 35
          },
          "openingHours": {
            "open": "08:00",
            "close": "17:30"
          },
          "bestVisitSeason": ["夏", "秋"],
          "rating": 4.8,
          "visitDuration": "4小时",
          "createdAt": "2023-01-23T00:00:00Z",
          "updatedAt": "2023-01-23T00:00:00Z"
        }
      ]
      
      // 确保每个景点都有空的图片数组，使用渐变色背景
      scenicSpots.value.forEach(spot => {
        spot.images = [];
      });
      
      console.log('景点数据加载完成，共', scenicSpots.value.length, '个景点')
      return scenicSpots.value
    } catch (err) {
      console.error('加载景点数据失败', err)
      error.value = '加载景点数据失败，请稍后重试'
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  // 加载标签数据
  async function loadTags() {
    isLoading.value = true
    error.value = null
    
    try {
      console.log('开始加载标签数据')
      
      // 直接使用硬编码的标签数据，确保数据始终可用
      tags.value = [
        // 类型标签
        {
          "id": "type-historical",
          "name": "历史遗迹",
          "category": "类型",
          "color": "#8e44ad"
        },
        {
          "id": "type-cultural",
          "name": "文化体验",
          "category": "类型",
          "color": "#f39c12"
        },
        {
          "id": "type-natural",
          "name": "自然风光",
          "category": "类型",
          "color": "#27ae60"
        },
        {
          "id": "type-religious",
          "name": "宗教圣地",
          "category": "类型",
          "color": "#3498db"
        },
        {
          "id": "type-adventure",
          "name": "探险体验",
          "category": "类型",
          "color": "#e74c3c"
        },
        {
          "id": "type-educational",
          "name": "教育学习",
          "category": "类型",
          "color": "#9b59b6"
        },
        
        // 地理特征标签
        {
          "id": "geo-mountain",
          "name": "山地",
          "category": "地理特征",
          "color": "#2980b9"
        },
        {
          "id": "geo-desert",
          "name": "沙漠",
          "category": "地理特征",
          "color": "#e67e22"
        },
        {
          "id": "geo-lake",
          "name": "湖泊",
          "category": "地理特征",
          "color": "#1abc9c"
        },
        {
          "id": "geo-river",
          "name": "河流",
          "category": "地理特征",
          "color": "#3498db"
        },
        {
          "id": "geo-grassland",
          "name": "草原",
          "category": "地理特征",
          "color": "#2ecc71"
        },
        {
          "id": "geo-forest",
          "name": "森林",
          "category": "地理特征",
          "color": "#16a085"
        },
        
        // 文化标签
        {
          "id": "culture-architecture",
          "name": "建筑艺术",
          "category": "文化",
          "color": "#9b59b6"
        },
        {
          "id": "culture-art",
          "name": "艺术欣赏",
          "category": "文化",
          "color": "#3498db"
        },
        {
          "id": "culture-food",
          "name": "美食文化",
          "category": "文化",
          "color": "#e74c3c"
        },
        {
          "id": "culture-ethnic",
          "name": "民族风情",
          "category": "文化",
          "color": "#f1c40f"
        },
        {
          "id": "culture-archaeology",
          "name": "考古遗址",
          "category": "文化",
          "color": "#95a5a6"
        },
        {
          "id": "culture-museum",
          "name": "博物馆",
          "category": "文化",
          "color": "#34495e"
        },
        
        // 活动标签
        {
          "id": "activity-hiking",
          "name": "徒步",
          "category": "活动",
          "color": "#2ecc71"
        },
        {
          "id": "activity-photography",
          "name": "摄影",
          "category": "活动",
          "color": "#3498db"
        },
        {
          "id": "activity-sightseeing",
          "name": "观光",
          "category": "活动",
          "color": "#1abc9c"
        },
        {
          "id": "activity-exploration",
          "name": "探索",
          "category": "活动",
          "color": "#d35400"
        },
        {
          "id": "activity-shopping",
          "name": "购物",
          "category": "活动",
          "color": "#e74c3c"
        },
        {
          "id": "activity-roadtrip",
          "name": "公路旅行",
          "category": "活动",
          "color": "#8e44ad"
        },
        
        // 季节标签
        {
          "id": "season-spring",
          "name": "春季",
          "category": "季节",
          "color": "#2ecc71"
        },
        {
          "id": "season-summer",
          "name": "夏季",
          "category": "季节",
          "color": "#e74c3c"
        },
        {
          "id": "season-autumn",
          "name": "秋季",
          "category": "季节",
          "color": "#f39c12"
        },
        {
          "id": "season-winter",
          "name": "冬季",
          "category": "季节",
          "color": "#3498db"
        },
        
        // 预算标签
        {
          "id": "budget-low",
          "name": "经济实惠",
          "category": "预算",
          "color": "#2ecc71"
        },
        {
          "id": "budget-medium",
          "name": "中等消费",
          "category": "预算",
          "color": "#f39c12"
        },
        {
          "id": "budget-high",
          "name": "高端享受",
          "category": "预算",
          "color": "#9b59b6"
        },
        
        // 人群标签
        {
          "id": "crowd-family",
          "name": "亲子家庭",
          "category": "人群",
          "color": "#3498db"
        },
        {
          "id": "crowd-couples",
          "name": "情侣约会",
          "category": "人群",
          "color": "#e74c3c"
        },
        {
          "id": "crowd-friends",
          "name": "朋友聚会",
          "category": "人群",
          "color": "#f39c12"
        },
        {
          "id": "crowd-solo",
          "name": "独自旅行",
          "category": "人群",
          "color": "#9b59b6"
        }
      ] as Tag[]
      
      console.log('标签数据加载成功，数量:', tags.value.length)
    } catch (err) {
      console.error('加载标签数据失败:', err)
      error.value = '加载标签数据失败'
    } finally {
      isLoading.value = false
    }
  }

  // 通过ID获取景点
  function getScenicSpotById(id: string) {
    return scenicSpots.value.find(spot => spot.id === id) || null
  }
  
  // 通过标签筛选景点
  function filterScenicSpotsByTags(tagIds: string[]) {
    if (!tagIds.length) return scenicSpots.value
    
    return scenicSpots.value.filter(spot => {
      return tagIds.some(tagId => spot.tags.includes(tagId))
    })
  }
  
  // 获取景点的标签对象数组
  function getScenicSpotTags(scenicSpot: ScenicSpot) {
    return scenicSpot.tags
      .map(tagId => tagMap.value.get(tagId))
      .filter(tag => tag !== undefined) as Tag[]
  }
  
  // 添加新景点
  function addScenicSpot(newSpot: Omit<ScenicSpot, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const scenicSpot: ScenicSpot = {
      ...newSpot,
      id: `scenic-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    } as ScenicSpot;
    
    scenicSpots.value.push(scenicSpot)
    // 在实际应用中，这里应该发送API请求保存数据
  }
  
  // 更新景点信息
  function updateScenicSpot(updates: Partial<ScenicSpot> & { id: string }) {
    const index = scenicSpots.value.findIndex(spot => spot.id === updates.id)
    if (index === -1) return
    
    scenicSpots.value[index] = {
      ...scenicSpots.value[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    // 在实际应用中，这里应该发送API请求更新数据
  }
  
  // 删除景点
  function deleteScenicSpot(id: string) {
    scenicSpots.value = scenicSpots.value.filter(spot => spot.id !== id)
    // 在实际应用中，这里应该发送API请求删除数据
  }
  
  // 添加标签
  function addTag(newTag: Omit<Tag, 'id'> & { id?: string }) {
    const tag: Tag = {
      ...newTag,
      id: newTag.id || `tag-${Date.now()}`
    }
    
    tags.value.push(tag)
    // 在实际应用中，这里应该发送API请求保存数据
  }
  
  // 更新标签
  function updateTag(updates: Partial<Tag> & { id: string }) {
    const index = tags.value.findIndex(tag => tag.id === updates.id)
    if (index === -1) return
    
    tags.value[index] = {
      ...tags.value[index],
      ...updates
    }
    // 在实际应用中，这里应该发送API请求更新数据
  }
  
  // 删除标签
  function deleteTag(id: string) {
    tags.value = tags.value.filter(tag => tag.id !== id)
    // 在实际应用中，这里应该发送API请求删除数据
    
    // 同时删除景点中的相关标签
    scenicSpots.value.forEach(spot => {
      if (spot.tags.includes(id)) {
        spot.tags = spot.tags.filter(tagId => tagId !== id)
      }
    })
  }
  
  // 兼容性方法 - 用于支持现有组件调用
  async function fetchAllScenicSpots() {
    return await loadScenicSpots()
  }
  
  // 兼容性方法 - 用于支持现有组件调用
  async function fetchAllTags() {
    return await loadTags()
  }
  
  return {
    scenicSpots,
    tags,
    isLoading,
    error,
    tagMap,
    tagsByCategory,
    loadScenicSpots,
    loadTags,
    fetchAllScenicSpots,
    fetchAllTags,
    getScenicSpotById,
    filterScenicSpotsByTags,
    getScenicSpotTags,
    addScenicSpot,
    updateScenicSpot,
    deleteScenicSpot,
    addTag,
    updateTag,
    deleteTag
  }
}) 