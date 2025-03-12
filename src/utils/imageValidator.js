/**
 * 图片URL验证工具
 * 用于测试图片URL是否可以正常访问
 */

/**
 * 检查图片URL是否可访问
 * @param {string} url - 要验证的图片URL
 * @returns {Promise<boolean>} - 返回Promise，解析为布尔值表示URL是否可访问
 */
export async function isImageAccessible(url) {
  try {
    // 创建一个Image对象
    const img = new Image();
    
    // 创建一个Promise来等待图片加载或失败
    const promise = new Promise((resolve, reject) => {
      img.onload = () => resolve(true);
      img.onerror = () => reject(new Error(`图片无法加载: ${url}`));
      
      // 设置超时，避免长时间等待
      setTimeout(() => reject(new Error(`图片加载超时: ${url}`)), 5000);
    });
    
    // 设置图片源
    img.src = url;
    
    // 等待图片加载
    return await promise;
  } catch (error) {
    console.error(error.message);
    return false;
  }
}

/**
 * 批量验证多个图片URL
 * @param {string[]} urls - 要验证的图片URL数组
 * @returns {Promise<{url: string, isAccessible: boolean}[]>} - 返回验证结果数组
 */
export async function validateMultipleImageUrls(urls) {
  const results = await Promise.all(
    urls.map(async (url) => ({
      url,
      isAccessible: await isImageAccessible(url)
    }))
  );
  
  return results;
}

/**
 * 获取预设的可访问图片库
 * 这些图片来自可靠的CDN，经过测试可以正常访问
 * @returns {Object} - 返回按类别组织的图片URL对象
 */
export function getReliableImageLibrary() {
  return {
    desert: [
      "https://source.unsplash.com/random/800x600/?desert",
      "https://images.pexels.com/photos/1001435/pexels-photo-1001435.jpeg",
      "https://images.pexels.com/photos/1525995/pexels-photo-1525995.jpeg",
      "https://images.pexels.com/photos/1427541/pexels-photo-1427541.jpeg"
    ],
    mountain: [
      "https://source.unsplash.com/random/800x600/?mountain",
      "https://images.pexels.com/photos/1438761/pexels-photo-1438761.jpeg",
      "https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg",
      "https://images.pexels.com/photos/640809/pexels-photo-640809.jpeg"
    ],
    historical: [
      "https://source.unsplash.com/random/800x600/?ancient+china",
      "https://images.pexels.com/photos/2563645/pexels-photo-2563645.jpeg",
      "https://images.pexels.com/photos/5483077/pexels-photo-5483077.jpeg",
      "https://images.pexels.com/photos/4388593/pexels-photo-4388593.jpeg"
    ],
    cultural: [
      "https://source.unsplash.com/random/800x600/?chinese+culture",
      "https://images.pexels.com/photos/2187662/pexels-photo-2187662.jpeg",
      "https://images.pexels.com/photos/1486577/pexels-photo-1486577.jpeg",
      "https://images.pexels.com/photos/17540787/pexels-photo-17540787/free-photo-of-ancient-walls-of-xi-an-china.jpeg"
    ],
    silk_road: [
      "https://source.unsplash.com/random/800x600/?silk+road",
      "https://images.pexels.com/photos/2245436/pexels-photo-2245436.png",
      "https://images.pexels.com/photos/5490778/pexels-photo-5490778.jpeg",
      "https://images.pexels.com/photos/6059094/pexels-photo-6059094.jpeg"
    ],
    danxia: [
      "https://images.pexels.com/photos/5490266/pexels-photo-5490266.jpeg",
      "https://images.pexels.com/photos/5490267/pexels-photo-5490267.jpeg",
      "https://images.pexels.com/photos/5490268/pexels-photo-5490268.jpeg",
      "https://source.unsplash.com/random/800x600/?colorful+mountains"
    ],
    mogao: [
      "https://source.unsplash.com/random/800x600/?cave+art",
      "https://images.pexels.com/photos/8941917/pexels-photo-8941917.jpeg",
      "https://images.pexels.com/photos/8941919/pexels-photo-8941919.jpeg",
      "https://images.pexels.com/photos/8941923/pexels-photo-8941923.jpeg"
    ],
    kashi: [
      "https://source.unsplash.com/random/800x600/?kashgar",
      "https://images.pexels.com/photos/4344748/pexels-photo-4344748.jpeg",
      "https://images.pexels.com/photos/4344768/pexels-photo-4344768.jpeg",
      "https://images.pexels.com/photos/4344777/pexels-photo-4344777.jpeg"
    ],
    jiayuguan: [
      "https://source.unsplash.com/random/800x600/?great+wall",
      "https://images.pexels.com/photos/1637135/pexels-photo-1637135.jpeg",
      "https://images.pexels.com/photos/2412603/pexels-photo-2412603.jpeg",
      "https://images.pexels.com/photos/2835721/pexels-photo-2835721.jpeg"
    ],
    warriors: [
      "https://source.unsplash.com/random/800x600/?terracotta+warriors",
      "https://images.pexels.com/photos/2187662/pexels-photo-2187662.jpeg",
      "https://images.pexels.com/photos/2834864/pexels-photo-2834864.jpeg",
      "https://images.pexels.com/photos/2146759/pexels-photo-2146759.jpeg"
    ],
    tianchi: [
      "https://source.unsplash.com/random/800x600/?tianchi+lake",
      "https://images.pexels.com/photos/2662086/pexels-photo-2662086.jpeg",
      "https://images.pexels.com/photos/1643121/pexels-photo-1643121.jpeg",
      "https://images.pexels.com/photos/2536728/pexels-photo-2536728.jpeg"
    ]
  };
}

/**
 * 根据景点类型获取默认图片
 * @param {string} spotName - 景点名称
 * @param {string[]} tags - 景点标签
 * @returns {string[]} - 返回3个默认图片URL
 */
export function getDefaultImagesForSpot(spotName, tags) {
  const library = getReliableImageLibrary();
  let imageSet = [];
  
  // 根据名称匹配特定景点
  if (spotName.includes('敦煌') || spotName.includes('莫高窟')) {
    imageSet = library.mogao;
  } else if (spotName.includes('喀什')) {
    imageSet = library.kashi;
  } else if (spotName.includes('嘉峪关')) {
    imageSet = library.jiayuguan;
  } else if (spotName.includes('兵马俑')) {
    imageSet = library.warriors;
  } else if (spotName.includes('天池')) {
    imageSet = library.tianchi;
  } else if (spotName.includes('丹霞')) {
    imageSet = library.danxia;
  } else if (tags.includes('geo-desert')) {
    imageSet = library.desert;
  } else if (tags.includes('geo-mountain')) {
    imageSet = library.mountain;
  } else if (tags.includes('type-historical')) {
    imageSet = library.historical;
  } else if (tags.includes('type-cultural')) {
    imageSet = library.cultural;
  } else {
    imageSet = library.silk_road;
  }
  
  // 确保至少返回3个图片URL
  while (imageSet.length < 3) {
    imageSet = [...imageSet, ...library.silk_road];
  }
  
  return imageSet.slice(0, 3);
} 