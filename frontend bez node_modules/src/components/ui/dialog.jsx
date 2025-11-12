import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import * as RadixDialog from '@radix-ui/react-dialog';
import { useTheme } from '@/context/ThemeContext.jsx';
import { cn } from '@/lib/utils.ts';

const Dialog = ({ children, ...props }) => {
  return <RadixDialog.Root {...props}>{children}</RadixDialog.Root>;
};
Dialog.propTypes = {
  children: PropTypes.node,
};

const DialogTrigger = RadixDialog.Trigger;

const DialogPortal = ({ className, children, ...props }) => (
  <RadixDialog.Portal {...props}>
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center', className)}>
      {children}
    </div>
  </RadixDialog.Portal>
);
DialogPortal.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

const DialogOverlay = forwardRef(({ className, ...props }, ref) => (
  <RadixDialog.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity', className)}
    {...props}
  />
));
DialogOverlay.displayName = 'DialogOverlay';
DialogOverlay.propTypes = {
  className: PropTypes.string,
};

const DialogContent = forwardRef(({ className, children, ...props }, ref) => {
  const { theme } = useTheme();

  return (
    <DialogPortal>
      <DialogOverlay />
      <RadixDialog.Content
        ref={ref}
        className={cn(
          'z-50 w-full max-w-lg scale-100 rounded-2xl border bg-white p-6 text-black shadow-lg transition',
          theme === 'dark' && 'bg-zinc-900 text-white',
          className
        )}
        {...props}
      >
        {children}
      </RadixDialog.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = 'DialogContent';
DialogContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

const DialogHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
);
DialogHeader.propTypes = {
  className: PropTypes.string,
};

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);
DialogFooter.propTypes = {
  className: PropTypes.string,
};

const DialogTitle = forwardRef(({ className, ...props }, ref) => {
  return (
    <RadixDialog.Title
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
});
DialogTitle.displayName = 'DialogTitle';
DialogTitle.propTypes = {
  className: PropTypes.string,
};

const DialogDescription = forwardRef(({ className, ...props }, ref) => (
  <RadixDialog.Description ref={ref} className={cn('text-sm text-zinc-500', className)} {...props} />
));
DialogDescription.displayName = 'DialogDescription';
DialogDescription.propTypes = {
  className: PropTypes.string,
};

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

// ✅ FAZA 9 – motywy (useTheme → dark mode styling)
// ✅ FAZA 12 – komponentowe statusy/styling (portal/overlay/content)
