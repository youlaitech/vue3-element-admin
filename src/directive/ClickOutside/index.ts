import { Directive } from 'vue';

declare type NoNameFUnctionReturnVoid = () => void;

export const clickOutside: Directive<HTMLElement, NoNameFUnctionReturnVoid> =
  (() => {
    const checkIfClickedInside = (
      event: Event,
      element: HTMLElement,
      callBackFn: NoNameFUnctionReturnVoid
    ) => {
      console.log('element', element);
      const isInside = event.composedPath().includes(element);

      if (isInside) {
        return false;
      } else {
        callBackFn();
      }
    };

    const allListeners: {
      element: HTMLElement;
      listener: (e: Event) => void;
    }[] = [];

    return {
      created(element) {
        element.dataset.clicked = 'false';
      },

      mounted(element, binding) {
        const myListener = (e: Event) => {
          checkIfClickedInside(e, element, binding.value);
        };
        allListeners.push({ element, listener: myListener });
        window.addEventListener('click', myListener);
      },

      unmounted(element) {
        const eventIndex = allListeners.findIndex(
          listener => listener.element === element
        );

        if (eventIndex !== -1) {
          const listener = allListeners[eventIndex].listener;
          window.removeEventListener('click', listener);
          allListeners.splice(eventIndex, 1);
        }
      }
    };
  })();
