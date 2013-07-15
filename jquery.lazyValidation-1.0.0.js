/**
 * Lazy Validation
 *
 * Highly customizable form validation
 *
 */

;(function ($, window, document) {

  var

    // Set some defaults
    defaults = {
      validateOnEvent           : 'blur',
      validClass                : false,
      invalidClass              : 'has-error',
      error : {
        prepend                 : false,
        append                  : true,
        show                    : true,
        text                    : 'Error',
        tag                     : 'div',
        parent                  : '.control-group',
        class                   : false
      },
      validators                : {},
      regex : {
        allowedAlpha            : '[a-zA-Z]',
        allowedNumerals         : '[0-9]',
        allowedAlphaNumeric     : '[a-zA-Z0-9]',
        onlyAlpha               : '^[A-z]+$'
      }
    },

    // Set the name of the plugin
    pluginName = 'lazyValidation';

  /**
   * Constructor
   */

  function LazyValidation (element, options) {

    // Set the current DOM node being acted upon
    this.element = element;

    // Set the current jQuery object being acted upon
    this.$element = $(element);

    // Set the parent form element
    this.$form = this.$element.closest('form');

    // Set the current value of the input
    this.val;

    // Set container to hold validation rules
    this.validators = {};

    // Set response object
    this.response = {};

    // Set allowed events
    this.allowedEvents = [
      'keydown', 'keypress', 'keyup',
      'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'hover', 'click', 'dblclick',
      'focus', 'blur', 'focusin', 'focusout', 'change', 'select'
    ];

    // Set the current DOM node tag name being acted upon (e.g. "select" or "input")
    this.tag = this.$element.prop('tagName').toLowerCase();

    // Merge the options into the defaults
    this.options = $.extend( true, {}, defaults, options );

    // Set a reference to the original, un-merged defaults
    this._defaults = defaults;

    // Set a reference to the name of the plugin
    this._name = pluginName;

    // Sanitize and set the error tag
    this.rawErrorTag = this.options.error.tag.replace(/[^a-zA-Z]/g, '').toLowerCase();

    // To find if we're currently acting upon a "submit", "checkbox" or "radio" element,
    // set references to the <input> "type" and "name" attributes
    if (this.tag == 'input') {
      this.inputType = this.$element.attr('type');
    };

    if (this.options.error.parent == undefined || !this.options.error.parent) {
      this.options.error.parent = this.$element;
    };

    // Away we go!
    this.init();

  };

  /**
   * Public methods
   */

  LazyValidation.prototype.init = function () {
    var self = this;

    this.validators = {

      notBlank: function (val, options) {
        return ( val.length != 0 );
      },

      minimumLength : function (val, options) {
        return ( val.length >= options.validators.minimumLength );
      },

      // Renamed from "maxLength" to "maximumLength" because of JS reserved words
      maximumLength : function (val, options) {
        return ( val.length <= options.validators.maximumLength );
      },

      exactLength : function (val, options) {
        return ( val.length == options.validators.exactLength );
      },

      matchesFieldIgnoreCase : function (val, options) {
        otherVal = $('#' + options.validators.matchesFieldIgnoreCase).val();
        if (val && otherVal) {
          return ( val.toLowerCase() == otherVal.toLowerCase() );
        } else {
          return false;
        };
      },

      matchesField : function (val, options) {
        return ( val == $('#' + options.validators.matchesField).val() );
      },

      similarField : function (val, options) {
        var similarFieldVal = $('#' + options.validators.similarField).val(),
            similarityRegExp = new RegExp( similarFieldVal, 'g');
        return ( ( val.match( similarityRegExp ) || [] ).length >= 1 );
      },

      dissimilarField : function (val, options) {
        var dissimilarFieldVal = $('#' + options.validators.dissimilarField).val(),
            dissimilarityRegExp = new RegExp( dissimilarFieldVal, 'gi');
        if (dissimilarFieldVal == '') {
          return true;
        } else {
          return ( ( val.match( dissimilarityRegExp ) || [] ).length <= 0 );
        };
      },

      email : function (val, options) {
        return ( /^([a-z0-9~*_\+\-\.]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i.test( val ) );
      },

      minAlpha : function (val, options) {
        var minAlphaRegExp = new RegExp( options.regex.allowedAlpha + '{' + options.validators.minAlpha + ',}', 'g' );
        return ( minAlphaRegExp.test( val ) );
      },

      maxAlpha : function (val, options) {
        var maxAlphaRegExp = new RegExp( options.regex.allowedAlpha, 'g' );
        return ( ( val.match( maxAlphaRegExp ) || [] ).length <= options.validators.maxAlpha );
      },

      minNumerals : function (val, options) {
        var minNumeralsRegExp = new RegExp( options.regex.allowedNumerals + '{' + options.validators.minNumerals + ',}', 'g' );
        return ( minNumeralsRegExp.test( val ) );
      },

      maxNumerals : function (val, options) {
        var maxNumeralsRegExp = new RegExp( options.regex.allowedNumerals, 'g' );
        return ( ( val.match( maxNumeralsRegExp ) || [] ).length <= options.validators.maxNumerals );
      },

      checked : function (val, options) {
        return ( self.$element.is(':checked') );
      },

      onlyAlpha : function (val, options) {
        return ( this.options.regex.onlyAlpha.test( val ) );
      },

      noAlpha : function (val, options) {
        return !( /[a-zA-Z]/g.test( val ) );
      },

      onlyNumerals : function (val, options) {
        return ( /^\d+$/.test( val ) );
      },

      onlyAlphaNumeric : function (val, options) {
        var alphaNumericRegExp = new RegExp( options.regex.allowedAlphaNumeric, 'g' );
        return ( alphaNumericRegExp.test( val ) );
      },

      onlyAlphanumericAndPunctuation : function (val, options) {
        return !( /[^a-zA-Z0-9\s\-=+_\|!@#$%^&*()`~\[\]{};:\'",<.>\/?]/.test( val ) );
      },

      noSpaces : function (val, options) {
        return !( /[ ]+/.test( val ) );
      },

      esoDisplayName  : function (val, options) {
        return ( /^[a-zA-Z0-9\_\-\u00E4\u00C4\u00EB\u00CB\u00EF\u00CF\u00F6\u00D6\u00FC\u00DC\u00FF\u0178\u00E9\u00C9\u00E0\u00C0\u00E8\u00C8\u00F9\u00D9\u00E2\u00C2\u00EA\u00CA\u00EE\u00CE\u00F4\u00D4\u00FB\u00DB\u00E7\u00C7\u00DF\u0153\u0152\u00E6\u00C6]+$/.test( val ) );
      },

      noAdjacentSymbols : function (val, options) {
        var prevChar;
        for ( var i = 0; i < val.length; i++ ) {
          if ( ( /[\_\-]/.test(prevChar) ) && ( /[\_\-]/.test(val[i]) ) ) return false;
          prevChar = val[i];
        };
        return true;
      },

      maxCharacterRepeats : function (val, options) {
        return !( /([a-z0-9\u00E4\u00C4\u00EB\u00CB\u00EF\u00CF\u00F6\u00D6\u00FC\u00DC\u00FF\u0178\u00E9\u00C9\u00E0\u00C0\u00E8\u00C8\u00F9\u00D9\u00E2\u00C2\u00EA\u00CA\u00EE\u00CE\u00F4\u00D4\u00FB\u00DB\u00E7\u00C7\u00DF\u0153\u0152\u00E6\u00C6])\1\1\1/.test( val.toLowerCase() ) );
      },

      startsWithAlphaNumeric : function (val, options) {
        return ( /^[a-zA-Z0-9\u00E4\u00C4\u00EB\u00CB\u00EF\u00CF\u00F6\u00D6\u00FC\u00DC\u00FF\u0178\u00E9\u00C9\u00E0\u00C0\u00E8\u00C8\u00F9\u00D9\u00E2\u00C2\u00EA\u00CA\u00EE\u00CE\u00F4\u00D4\u00FB\u00DB\u00E7\u00C7\u00DF\u0153\u0152\u00E6\u00C6]+/.test( val ) );
      },

      endsWithAlphaNumeric : function (val, options) {
        return ( /[a-zA-Z0-9\u00E4\u00C4\u00EB\u00CB\u00EF\u00CF\u00F6\u00D6\u00FC\u00DC\u00FF\u0178\u00E9\u00C9\u00E0\u00C0\u00E8\u00C8\u00F9\u00D9\u00E2\u00C2\u00EA\u00CA\u00EE\u00CE\u00F4\u00D4\u00FB\u00DB\u00E7\u00C7\u00DF\u0153\u0152\u00E6\u00C6]$/.test( val ) );
      },

      zipCode : function (val, options) {
        return ( /^\d{5}(?:[-\s]\d{4})?$/g.test( val ) );
      }

    };

    this.setClass = function () {
      // TODO: Handle checkboxes
      if (this.response.isInvalid) {
        if ( this.options.invalidClass ) {
          this.$element.addClass( this.options.invalidClass );
          if (this.options.error.parent != this.$element) {
            this.$element.closest( this.options.error.parent ).find('label').addClass( this.options.invalidClass );
          };
        };
        if ( this.options.validClass ) {
          this.$element.removeClass( this.options.validClass );
          if (this.options.error.parent != this.$element) {
            this.$element.closest( this.options.error.parent ).find('label').removeClass( this.options.validClass );
          };
        };
      } else {
        if ( this.options.invalidClass ) {
          this.$element.removeClass( this.options.invalidClass );
          if (this.options.error.parent != this.$element) {
            this.$element.closest( this.options.error.parent ).find('label').removeClass( this.options.invalidClass );
          };
        };
        if ( this.options.validClass ) {
          this.$element.addClass( this.options.validClass );
          if (this.options.error.parent != this.$element) {
            this.$element.closest( this.options.error.parent ).find('label').addClass( this.options.validClass );
          };
        };
      };
    };

    this.setValidity = function () {
      var isValid = true,
          isInvalid = false;
      for ( var key in this.response) {
        var value = this.response[key];
        if ( value == false || !value ) {
          isValid = false;
          isInvalid = true;
        };
      };
      this.response.isValid = isValid;
      this.response.isInvalid = isInvalid;
    };

    this.setData = function () {
      this.response.valueLength = this.val.length;
      this.response.hasAlpha = /[^a-zA-Z]/.test( this.val );
      this.response.hasNumerals = /[^0-9]/.test( this.val );
      this.response.hasPunctuation = /[^\-=+_\|!@#$%^&*()`~\[\]{};:\'",<.>\/?]/.test( this.val );
    };

    this.validate = function () {
      for ( var validator in this.options.validators ) {
        this.response[validator] = this.validators[validator]( this.val, this.options );
      };
      this.setValidity();
      this.setData();
      this.addRemoveError();
      this.onValidationComplete();
    };

    this.addRemoveError = function () {
      // if ( this.response.isValid ) {
      //   this.removeError();
      // } else {
      //   this.addError();
      // };
    };

    this.resetResponse = function () {
      this.response = {};
    };

    this.addError = function () {
      if ( this.options.error.show ) {
        this.removeError();
        if (this.options.error.parent != this.$element) {
          this.$element.closest( this.options.error.parent ).prepend( '<' + this.rawErrorTag + '></' + this.rawErrorTag + '>' );
        } else {
          this.$element.parent().prepend( '<' + this.rawErrorTag + ' id="' + this.options.error.class + '-' + this.$element.attr('id') + '"></' + this.rawErrorTag + '>' );
        };
        this.buildError();
      };
    };

    this.removeError = function () {
      if (this.options.error.parent != this.$element) {
        this.$element.parents( this.options.error.parent ).children( '.' + this.options.error.class ).first().remove();
      } else {
        this.$element.parent().children( '#' + this.options.error.class + '-' + this.$element.attr('id') ).remove();
      };
    };

    this.setError = function () {
      if (this.options.error.parent != this.$element) {
        this.$error = this.$element.closest( this.options.error.parent ).children().first();
      } else {
        this.$error = this.$element.parent().children().first();
      };
    };

    this.setErrorStyle = function () {
      if ( this.options.error.show ) {
        if (this.options.error.parent == this.$element) {
          this.$error.css({
            'width'    : this.$element.outerWidth(true),
            'display'  : 'block',
            'float'    : 'left',
            'margin'   : 0
          });
        };
      };
    };

    this.setErrorText = function () {
      if ( this.options.error.show ) {
        this.$error.text( this.options.error.text );
      };
    };

    this.setErrorClass = function () {
      if ( this.options.error.show ) {
        this.$error.addClass( this.options.error.class );
      };
    };

    this.buildError = function () {
      this.setError();
      this.setErrorText();
      this.setErrorClass();
      this.setErrorStyle();
    };

    this.onValidationComplete = function () {
      this.setClass();
      if ( this.options.onValidationComplete && typeof(this.options.onValidationComplete) == 'function' ) {
        this.response.element = this.element;
        this.options.onValidationComplete( this.response );
      };
      this.resetResponse();
    };

    this.checkValidBindEvents = function () {
      if ( $.isArray( this.options.validateOnEvent ) ) {
        validEvents = [];
        for ( var e in this.options.validateOnEvent ) {
          if ( $.inArray( e, self.allowedEvents ) > -1 ) {
            validEvents.push(e);
          };
        };
        this.options.validateOnEvent = validEvents.join(' ');
        this.bindEvents();
      } else if ( $.inArray( this.options.validateOnEvent, this.allowedEvents ) > -1 ) {
        this.bindEvents();
      };
    };

    this.bindEvents = function () {
      // This was formerly:
      // this.$element.on( this.options.validateOnEvent, function(){...})
      // but this did not work for dynamic / AJAXed form elements
      $(document).on( this.options.validateOnEvent, '#' + this.$element[0].id, function (event) {
        // Don't validate on tab (keyCode = 9)
        if ( event.which != 9 ) {
          self.val = self.$element.val();
          self.validate();
        };
      });
    };

    this.exec = function () {
      this.checkValidBindEvents();
    };

    this.exec();

  };

  /*
   * Plugin wrapper
   */

  $.fn[pluginName] = function (options) {

    // For every matched selector found...
    return this.each( function () {

      // Set some jQuery data if it doesn't already exist
      if ( !$.data( this, 'plugin_' + pluginName ) ) {
        $.data( this, 'plugin_' + pluginName, new LazyValidation( this, options ) );
      };

    });

  };

})(jQuery, window, document);
