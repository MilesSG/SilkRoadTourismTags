/**
 * 图片URL验证工具
 * 现在已改为使用渐变色背景，不再加载外部图片
 */

/**
 * 检查图片URL是否可访问 - 现在直接返回false
 * @param {string} url - 要验证的图片URL
 * @returns {Promise<boolean>} - 返回Promise，解析为布尔值表示URL是否可访问
 */
export async function isImageAccessible(url: string): Promise<boolean> {
  // 直接返回false，不再尝试加载外部图片
  return false;
}

interface ValidationResult {
  url: string;
  isAccessible: boolean;
}

/**
 * 批量验证多个图片URL - 现在直接返回全部不可访问
 * @param {string[]} urls - 要验证的图片URL数组
 * @returns {Promise<{url: string, isAccessible: boolean}[]>} - 返回验证结果数组
 */
export async function validateMultipleImageUrls(urls: string[]): Promise<ValidationResult[]> {
  // 将所有URL标记为不可访问
  return urls.map(url => ({
    url,
    isAccessible: false
  }));
}

interface ImageLibrary {
  [category: string]: string[];
}

/**
 * 获取预设的图片库 - 现在返回空数组
 * @returns {Object} - 返回按类别组织的空数组
 */
export function getReliableImageLibrary(): ImageLibrary {
  // 所有类别都返回空数组
  return {
    desert: [],
    mountain: [],
    historical: [],
    cultural: [],
    silk_road: [],
    danxia: [],
    mogao: [],
    kashi: [],
    jiayuguan: [],
    warriors: [],
    tianchi: []
  };
}

/**
 * 根据景点类型获取默认图片 - 现在返回空数组
 * @param {string} spotName - 景点名称
 * @param {string[]} tags - 景点标签
 * @returns {string[]} - 返回空数组
 */
export function getDefaultImagesForSpot(spotName?: string, tags?: string[]): string[] {
  // 直接返回空数组
  return [];
} 