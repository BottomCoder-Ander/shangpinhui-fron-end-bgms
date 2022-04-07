//获取三级联动的数据接口
import request from "@/utils/request";
//URL:  /admin/product/getCategory1  GET
//一级分类的接口
export const reqGetCategory1 = () =>
  request({ url: "/admin/product/getCategory1", method: "get" });
//URL: /admin/product/getCategory2/{category1Id}  GET
//二级分类的接口
export const reqGetCategory2 = (category1Id) =>
  request({ url: `/admin/product/getCategory2/${category1Id}`, method: "get" });
//三级分类接口
export const reqGetCategory3 = (category2Id) =>
  request({ url: `/admin/product/getCategory3/${category2Id}`, method: "get" });
//获取属性列表
///admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}  get
export const reqAttrList = (category1Id, category2Id, category3Id) =>
  request({
    url: `/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`,
    method: "get",
  });

//添加属性的接口
//URL:/admin/product/saveAttrInfo  method:post    data
export const reqSaveAttrInfo = (data) =>
  request({ url: `/admin/product/saveAttrInfo`, method: "post", data });

//删除某一个售卖的属性
//URL:/admin/product/deleteAttr/{attrId}   method:delete
export const reqDeleteAttr = (attrId) =>
  request({ url: `/admin/product/deleteAttr/${attrId}`, method: "delete" });
