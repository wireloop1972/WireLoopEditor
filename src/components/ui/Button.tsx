'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600',
        destructive:
          'bg-red-500 text-white hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600',
        outline:
          'border border-orange-500/20 bg-transparent hover:bg-orange-500/10 hover:text-orange-500',
        secondary:
          'bg-orange-100 text-orange-900 hover:bg-orange-200 dark:bg-orange-700 dark:text-orange-100 dark:hover:bg-orange-600',
        ghost:
          'hover:bg-orange-100 hover:text-orange-900 dark:hover:bg-orange-800 dark:hover:text-orange-50',
        link: 'text-orange-900 underline-offset-4 hover:underline dark:text-orange-50',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button; 