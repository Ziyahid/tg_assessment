import { ShoppingCart, Star } from 'lucide-react';

const ProductCard = ({ product, onBuyNow }) => {
  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
        <img
          src={product.image}
          alt={product.name}
          className="h-48 w-full object-cover object-center group-hover:opacity-75"
        />
      </div>
      
      <div className="mt-4 flex justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{product.category}</p>
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{product.description}</p>
          
          <div className="mt-2 flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-500">({product.reviews} reviews)</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <p className="text-lg font-medium text-gray-900">${product.price}</p>
        <button
          onClick={() => onBuyNow(product)}
          className="btn-primary flex items-center space-x-2"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;