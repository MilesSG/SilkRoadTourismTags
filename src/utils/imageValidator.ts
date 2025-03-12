/**
 * 图片URL验证工具
 * 用于测试图片URL是否可以正常访问，现在已改为使用本地渐变色替代
 */

/**
 * 检查图片URL是否可访问 - 现在直接返回true
 * @param {string} url - 要验证的图片URL
 * @returns {Promise<boolean>} - 返回Promise，解析为布尔值表示URL是否可访问
 */
export async function isImageAccessible(url: string): Promise<boolean> {
  // 直接返回true，不再尝试加载外部图片
  return true;
}

interface ValidationResult {
  url: string;
  isAccessible: boolean;
}

/**
 * 批量验证多个图片URL - 现在直接返回全部可访问
 * @param {string[]} urls - 要验证的图片URL数组
 * @returns {Promise<{url: string, isAccessible: boolean}[]>} - 返回验证结果数组
 */
export async function validateMultipleImageUrls(urls: string[]): Promise<ValidationResult[]> {
  // 将所有URL标记为可访问
  return urls.map(url => ({
    url,
    isAccessible: true
  }));
}

interface ImageLibrary {
  [category: string]: string[];
}

/**
 * 获取预设的图片库 - 现在返回空字符串
 * @returns {Object} - 返回按类别组织的空字符串对象
 */
export function getReliableImageLibrary(): ImageLibrary {
  // 所有类别都返回空字符串数组
  const emptyArray = [''];
  
  return {
    desert: emptyArray,
    mountain: emptyArray,
    historical: emptyArray,
    cultural: emptyArray,
    silk_road: emptyArray,
    danxia: emptyArray,
    mogao: emptyArray,
    kashi: emptyArray,
    jiayuguan: emptyArray,
    warriors: emptyArray,
    tianchi: emptyArray
  };
}

/**
 * 根据景点类型获取默认图片 - 现在返回空字符串数组
 * @param {string} spotName - 景点名称
 * @param {string[]} tags - 景点标签
 * @returns {string[]} - 返回空字符串数组
 */
export function getDefaultImagesForSpot(spotName?: string, tags?: string[]): string[] {
  // 直接返回一个包含单个空字符串的数组
  return [''];
} 