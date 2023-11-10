const consts = {
  role: {
    admin: 'ADMIN',
    production: 'PRODUCTION',
    sales: 'SALES',
    client: 'CLIENT',
  },
  token: {
    refresh: 'REFRESH',
    access: 'ACCESS',
    register: 'REGISTER',
  },
  apiPath: '/api',
  pageLength: 10,
  bucketRoutes: {
    orderRequest: 'order-request',
    product: 'product',
  },
  inventoryType: {
    product: 'PRODUCT',
    fabric: 'FABRIC',
    material: 'MATERIAL',
  },
  imagePath: {
  },
  orderPhases: ['Pronto a iniciar', 'En producción', 'Planchado y empaque', 'Listo para entrega'],
};

consts.imagePath.orderRequest = `${consts.apiPath}/image/orderRequest`;
consts.imagePath.order = `${consts.apiPath}/image/order`;
consts.imagePath.product = `${consts.apiPath}/image/product`;
consts.imagePath.productModel = `${consts.apiPath}/image/productModel`;

export default consts;
