import TranslationsProvider from '../../_locales/_provider';

global.TranslationProvider = new TranslationsProvider();

if (global.HTMLSpanElement) {
  const createTranslationElement = (originalElement, elementTag) => {
    const TranslationProto = Object.create(originalElement.prototype);

    TranslationProto.createdCallback = function createdCallback() {
      this._key = this.textContent;
      this.innerHTML = TranslationProvider.query(this.textContent);
    };
    TranslationProto.setKey = function setKey(newKey) {
      this._key = newKey;
      this.innerHTML = TranslationProvider.query(newKey);
    };
    TranslationProto.getKey = function getKey() {
      return this._key;
    };

    class TranslationElement extends originalElement {
      constructor() {
        super();
        this.initialized = false;
      }
      connectedCallback() {
        if (!this.initialized) {
          this._key = this.textContent;
          this.innerHTML = TranslationProvider.query(this.textContent);
        }
        this.initialized = true;
      }
      setKey(newKey) {
        this._key = newKey;
        this.innerHTML = TranslationProvider.query(newKey);
      }
      getKey() {
        return this._key;
      }
    }

    customElements.define(`translation-key${elementTag === 'span' ? '' : `-${elementTag}`}`, TranslationElement, { extends: elementTag });
    // window.ThumbImage = document.registerElement(, {
    //   prototype: TranslationProto,
    //   extends: elementTag,
    // });
  };

  createTranslationElement(HTMLSpanElement, 'span');
  createTranslationElement(HTMLParagraphElement, 'p');
  createTranslationElement(HTMLHeadingElement, 'h4');
}
