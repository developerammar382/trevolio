'use client';

import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { CartItem as ICartItem } from '@/context/CartContext';
import { useCurrency } from '@/hooks/useCurrency';

interface CartItemProps {
    item: ICartItem;
    onUpdateQuantity: (id: number, quantity: number) => void;
    onRemove: (id: number) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
    const { formatPrice } = useCurrency();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex gap-6 py-6 border-b border-border last:border-0"
        >
            <div className="w-24 h-24 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                {item.product.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                )}
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-medium text-foreground">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.product.category?.name}</p>
                        {item.product.selectedVariants && Object.keys(item.product.selectedVariants).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {Object.entries(item.product.selectedVariants).map(([key, value]) => (
                                    <span key={key} className="inline-flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md text-xs">
                                        <span className="text-muted-foreground">{key}:</span>
                                        <span className="font-medium">{value}</span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        {item.product.sale_price && Number(item.product.sale_price) > 0 ? (
                            <>
                                <p className="font-bold text-red-600">{formatPrice(Number(item.product.sale_price))}</p>
                                <p className="text-sm text-muted-foreground line-through">{formatPrice(Number(item.product.price))}</p>
                            </>
                        ) : (
                            <p className="font-bold text-foreground">{formatPrice(Number(item.product.price))}</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-3 bg-accent/50 rounded-lg p-1">
                        <button
                            onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            className="p-1 hover:bg-white rounded-md transition-colors"
                        >
                            <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:bg-white rounded-md transition-colors"
                        >
                            <FiPlus className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => onRemove(item.product.id)}
                        className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                    >
                        <FiTrash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Remove</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
