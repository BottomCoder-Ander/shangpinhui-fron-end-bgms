import request from "@/utils/request";
//获取SPU列表数据的接口
//URL:/admin/product/{page}/{limit}  get
export const reqSpuList = (page, limit, category3Id) =>
  request({
    url: `/admin/product/${page}/${limit}`,
    method: "get",
    params: { category3Id },
  });

//获取品牌列表
//URL:/admin/product/baseTrademark/getTrademarkList  method：get
export const reqTradeMarkList = () =>
  request({
    url: "/admin/product/baseTrademark/getTrademarkList",
    method: "get",
  });

//获取平台销售属性值（就是三个）
//URL:/admin/product/baseSaleAttrList  get
export const reqSaleAttrList = () =>
  request({ url: "/admin/product/baseSaleAttrList", method: "get" });

//获取某一个类（SPU）的图片
//admin/product/spuImageList/{spuId}  get
export const reqSupImageList = (spuId) =>
  request({ url: `/admin/product/spuImageList/${spuId}`, method: "get" });
//获取类（SPU）的信息
//URL:/admin/product/getSpuById/{spuId}  get
export const reqSpuInfo = (spuId) =>
  request({ url: `/admin/product/getSpuById/${spuId}`, method: "get" });

//新增或者修改SPU的函数
export const reqAddOrUpdateSpu = (spuInfo) => {
  //修改
  if (spuInfo.id) {
    return request({
      url: "/admin/product/updateSpuInfo",
      data: spuInfo,
      method: "post",
    });
  } else {
    //添加
    return request({
      url: "/admin/product/saveSpuInfo",
      data: spuInfo,
      method: "post",
    });
  }
};
//删除SPU
export const reqDeleteSpuById = (spuId) =>
  request({ url: `/admin/product/deleteSpu/${spuId}`, method: "delete" });

//获取平台属性的接口
///admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}  get
export const reqAttrList = (category1Id, category2Id, category3Id) =>
  request({
    url: `/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`,
    method: "get",
  });

//销售属性
///admin/product/spuSaleAttrList/{spuId}  get

export const reqSalesAttrList = (spuId) =>
  request({ url: `/admin/product/spuSaleAttrList/${spuId}`, method: "get" });

//图片列表
///admin/product/spuImageList/{spuId}  get
export const reqSpuImageList = (spuId) =>
  request({ url: `/admin/product/spuImageList/${spuId}`, method: "get" });

//保存SKU
///admin/product/saveSkuInfo  post

export const reqSaveSkuInfo = (skuInfo) =>
  request({ url: "/admin/product/saveSkuInfo", data: skuInfo, method: "post" });

//GET /admin/product/findBySpuId/{spuId}

export const reqSkuList = (spuId) =>
  request({ url: `/admin/product/findBySpuId/${spuId}`, method: "get" });
