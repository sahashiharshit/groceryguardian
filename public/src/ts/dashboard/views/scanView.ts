

type BarcodeCategory ={

_id:string;
name:string;
};

type BarcodeApiItem  = {

_id:string;
barcode:string
name:string;
categoryId?:BarcodeCategory;
createdAt:string;
updatedAt:string;

};

type BarcodeApiResponse ={
barcode?:BarcodeApiItem;

};

type NewItemPayload = {
barcode:string;
name:string;
category?:string;
}
export async function  render() {
    render
}