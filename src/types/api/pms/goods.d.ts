import { PageQueryParam, PageResult } from "../base"


/**
 * 商品查询参数类型声明
 */
export interface GoodsQueryParam extends PageQueryParam {
    name: stirng | undefined,
    categoryId: number | undefined
}

/**
 * 商品列表项类型声明
 */
export interface GoodsItem {
	id: string;
	name: string;
	categoryId?: any;
	brandId?: any;
	originPrice: string;
	price: string;
	sales: number;
	picUrl?: any;
	album?: any;
	unit?: any;
	description: string;
	detail: string;
	status?: any;
	categoryName: string;
	brandName: string;
	skuList: SkuItem[];
}

/**
 * 商品规格项类型声明
 */
export interface SkuItem {
	id: string;
	skuSn?: any;
	name: string;
	spuId?: any;
	specIds: string;
	price: string;
	stockNum: number;
	lockedStockNum?: any;
	picUrl?: any;
}

/**
 * 商品分页项类型声明
 */
export interface GoodsPageResult extends PageResult<GoodsItem[]> {

}

/**
 * 商品表单数据类型声明
 */
export interface GoodsFormData {
    id: number|undefined,
    deptId: number,
    username: string,
    nickname: string,
    password: string,
    mobile: string,
    email: string,
    gender: number,
    status: number,
    remark: string,
    roleIds: number[]
}


