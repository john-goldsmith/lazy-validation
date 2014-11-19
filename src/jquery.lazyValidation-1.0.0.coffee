###*
Lazy Validation

Highly customizable form validation
###
(($, window, document) ->
  
  # Set some defaults
  
  # Set the name of the plugin
  
  ###*
  Constructor
  ###
  LazyValidation = (element, options) ->
    
    # Set the current DOM node being acted upon
    @element = element
    
    # Set the current jQuery object being acted upon
    @$element = $(element)
    
    # Set the parent form element
    @$form = @$element.closest("form")
    
    # Set the current value of the input
    @val
    
    # Set container to hold validation rules
    @validators = {}
    
    # Set response object
    @response = {}
    
    # Set allowed events
    @allowedEvents = [
      "keydown"
      "keypress"
      "keyup"
      "mousedown"
      "mouseenter"
      "mouseleave"
      "mousemove"
      "mouseout"
      "mouseover"
      "mouseup"
      "hover"
      "click"
      "dblclick"
      "focus"
      "blur"
      "focusin"
      "focusout"
      "change"
      "select"
    ]
    
    # Set the current DOM node tag name being acted upon (e.g. "select" or "input")
    @tag = @$element.prop("tagName").toLowerCase()
    
    # Merge the options into the defaults
    @options = $.extend(true, {}, defaults, options)
    
    # Set a reference to the original, un-merged defaults
    @_defaults = defaults
    
    # Set a reference to the name of the plugin
    @_name = pluginName
    
    # Sanitize and set the error tag
    @rawErrorTag = @options.error.tag.replace(/[^a-zA-Z]/g, "").toLowerCase()
    
    # To find if we're currently acting upon a "submit", "checkbox" or "radio" element,
    # set references to the <input> "type" and "name" attributes
    @inputType = @$element.attr("type")  if @tag is "input"
    @options.error.parent = @$element  if not @options.error.parent? or not @options.error.parent
    
    # Away we go!
    @init()
    return
  defaults =
    validateOnEvent: "blur"
    validClass: false
    invalidClass: "has-error"
    error:
      prepend: false
      append: true
      show: true
      text: "Error"
      tag: "div"
      parent: ".control-group"
      class: false

    validators: {}
    regex:
      allowedAlpha: "[a-zA-Z]"
      allowedNumerals: "[0-9]"
      allowedAlphaNumeric: "[a-zA-Z0-9]"
      onlyAlpha: "^[A-z]+$"

  pluginName = "lazyValidation"
  
  ###*
  Public methods
  ###
  LazyValidation::init = ->
    self = this
    @validators =
      notBlank: (val, options) ->
        val.length isnt 0

      minimumLength: (val, options) ->
        val.length >= options.validators.minimumLength

      
      # Renamed from "maxLength" to "maximumLength" because of JS reserved words
      maximumLength: (val, options) ->
        val.length <= options.validators.maximumLength

      exactLength: (val, options) ->
        val.length is options.validators.exactLength

      matchesFieldIgnoreCase: (val, options) ->
        otherVal = $("#" + options.validators.matchesFieldIgnoreCase).val()
        if val and otherVal
          return (val.toLowerCase() is otherVal.toLowerCase())
        else
          return false
        return

      matchesField: (val, options) ->
        val is $("#" + options.validators.matchesField).val()

      similarField: (val, options) ->
        similarFieldVal = $("#" + options.validators.similarField).val()
        similarityRegExp = new RegExp(similarFieldVal, "g")
        (val.match(similarityRegExp) or []).length >= 1

      dissimilarField: (val, options) ->
        dissimilarFieldVal = $("#" + options.validators.dissimilarField).val()
        dissimilarityRegExp = new RegExp(dissimilarFieldVal, "gi")
        if dissimilarFieldVal is ""
          return true
        else
          return ((val.match(dissimilarityRegExp) or []).length <= 0)
        return

      email: (val, options) ->
        /^([a-z0-9~*_\+\-\.]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i.test val

      minAlpha: (val, options) ->
        minAlphaRegExp = new RegExp(options.regex.allowedAlpha + "{" + options.validators.minAlpha + ",}", "g")
        minAlphaRegExp.test val

      maxAlpha: (val, options) ->
        maxAlphaRegExp = new RegExp(options.regex.allowedAlpha, "g")
        (val.match(maxAlphaRegExp) or []).length <= options.validators.maxAlpha

      minNumerals: (val, options) ->
        minNumeralsRegExp = new RegExp(options.regex.allowedNumerals + "{" + options.validators.minNumerals + ",}", "g")
        minNumeralsRegExp.test val

      maxNumerals: (val, options) ->
        maxNumeralsRegExp = new RegExp(options.regex.allowedNumerals, "g")
        (val.match(maxNumeralsRegExp) or []).length <= options.validators.maxNumerals

      checked: (val, options) ->
        self.$element.is ":checked"

      onlyAlpha: (val, options) ->
        @options.regex.onlyAlpha.test val

      noAlpha: (val, options) ->
        not (/[a-zA-Z]/g.test(val))

      onlyNumerals: (val, options) ->
        /^\d+$/.test val

      onlyAlphaNumeric: (val, options) ->
        alphaNumericRegExp = new RegExp(options.regex.allowedAlphaNumeric, "g")
        alphaNumericRegExp.test val

      onlyAlphanumericAndPunctuation: (val, options) ->
        not (/[^a-zA-Z0-9\s\-=+_\|!@#$%^&*()`~\[\]{};:\'",<.>\/?]/.test(val))

      noSpaces: (val, options) ->
        not (/[ ]+/.test(val))

      esoDisplayName: (val, options) ->
        /^[a-zA-Z0-9\_\-\u00E4\u00C4\u00EB\u00CB\u00EF\u00CF\u00F6\u00D6\u00FC\u00DC\u00FF\u0178\u00E9\u00C9\u00E0\u00C0\u00E8\u00C8\u00F9\u00D9\u00E2\u00C2\u00EA\u00CA\u00EE\u00CE\u00F4\u00D4\u00FB\u00DB\u00E7\u00C7\u00DF\u0153\u0152\u00E6\u00C6]+$/.test val

      noAdjacentSymbols: (val, options) ->
        prevChar = undefined
        i = 0

        while i < val.length
          return false  if (/[\_\-]/.test(prevChar)) and (/[\_\-]/.test(val[i]))
          prevChar = val[i]
          i++
        true

      maxCharacterRepeats: (val, options) ->
        not (/([a-z0-9\u00E4\u00C4\u00EB\u00CB\u00EF\u00CF\u00F6\u00D6\u00FC\u00DC\u00FF\u0178\u00E9\u00C9\u00E0\u00C0\u00E8\u00C8\u00F9\u00D9\u00E2\u00C2\u00EA\u00CA\u00EE\u00CE\u00F4\u00D4\u00FB\u00DB\u00E7\u00C7\u00DF\u0153\u0152\u00E6\u00C6])\1\1\1/.test(val.toLowerCase()))

      startsWithAlphaNumeric: (val, options) ->
        /^[a-zA-Z0-9\u00E4\u00C4\u00EB\u00CB\u00EF\u00CF\u00F6\u00D6\u00FC\u00DC\u00FF\u0178\u00E9\u00C9\u00E0\u00C0\u00E8\u00C8\u00F9\u00D9\u00E2\u00C2\u00EA\u00CA\u00EE\u00CE\u00F4\u00D4\u00FB\u00DB\u00E7\u00C7\u00DF\u0153\u0152\u00E6\u00C6]+/.test val

      endsWithAlphaNumeric: (val, options) ->
        /[a-zA-Z0-9\u00E4\u00C4\u00EB\u00CB\u00EF\u00CF\u00F6\u00D6\u00FC\u00DC\u00FF\u0178\u00E9\u00C9\u00E0\u00C0\u00E8\u00C8\u00F9\u00D9\u00E2\u00C2\u00EA\u00CA\u00EE\u00CE\u00F4\u00D4\u00FB\u00DB\u00E7\u00C7\u00DF\u0153\u0152\u00E6\u00C6]$/.test val

      zipCode: (val, options) ->
        /^\d{5}(?:[-\s]\d{4})?$/g.test val

    @setClass = ->
      
      # TODO: Handle checkboxes
      if @response.isInvalid
        if @options.invalidClass
          @$element.addClass @options.invalidClass
          @$element.closest(@options.error.parent).find("label").addClass @options.invalidClass  unless @options.error.parent is @$element
        if @options.validClass
          @$element.removeClass @options.validClass
          @$element.closest(@options.error.parent).find("label").removeClass @options.validClass  unless @options.error.parent is @$element
      else
        if @options.invalidClass
          @$element.removeClass @options.invalidClass
          @$element.closest(@options.error.parent).find("label").removeClass @options.invalidClass  unless @options.error.parent is @$element
        if @options.validClass
          @$element.addClass @options.validClass
          @$element.closest(@options.error.parent).find("label").addClass @options.validClass  unless @options.error.parent is @$element
      return

    @setValidity = ->
      isValid = true
      isInvalid = false
      for key of @response
        value = @response[key]
        if value is false or not value
          isValid = false
          isInvalid = true
      @response.isValid = isValid
      @response.isInvalid = isInvalid
      return

    @setData = ->
      @response.valueLength = @val.length
      @response.hasAlpha = /[^a-zA-Z]/.test(@val)
      @response.hasNumerals = /[^0-9]/.test(@val)
      @response.hasPunctuation = /[^\-=+_\|!@#$%^&*()`~\[\]{};:\'",<.>\/?]/.test(@val)
      return

    @validate = ->
      for validator of @options.validators
        @response[validator] = @validators[validator](@val, @options)
      @setValidity()
      @setData()
      @addRemoveError()
      @onValidationComplete()
      return

    @addRemoveError = ->

    
    # if ( this.response.isValid ) {
    #   this.removeError();
    # } else {
    #   this.addError();
    # };
    @resetResponse = ->
      @response = {}
      return

    @addError = ->
      if @options.error.show
        @removeError()
        unless @options.error.parent is @$element
          @$element.closest(@options.error.parent).prepend "<" + @rawErrorTag + "></" + @rawErrorTag + ">"
        else
          @$element.parent().prepend "<" + @rawErrorTag + " id=\"" + @options.error.class + "-" + @$element.attr("id") + "\"></" + @rawErrorTag + ">"
        @buildError()
      return

    @removeError = ->
      unless @options.error.parent is @$element
        @$element.parents(@options.error.parent).children("." + @options.error.class).first().remove()
      else
        @$element.parent().children("#" + @options.error.class + "-" + @$element.attr("id")).remove()
      return

    @setError = ->
      unless @options.error.parent is @$element
        @$error = @$element.closest(@options.error.parent).children().first()
      else
        @$error = @$element.parent().children().first()
      return

    @setErrorStyle = ->
      if @options.error.show
        if @options.error.parent is @$element
          @$error.css
            width: @$element.outerWidth(true)
            display: "block"
            float: "left"
            margin: 0

      return

    @setErrorText = ->
      @$error.text @options.error.text  if @options.error.show
      return

    @setErrorClass = ->
      @$error.addClass @options.error.class  if @options.error.show
      return

    @buildError = ->
      @setError()
      @setErrorText()
      @setErrorClass()
      @setErrorStyle()
      return

    @onValidationComplete = ->
      @setClass()
      if @options.onValidationComplete and typeof (@options.onValidationComplete) is "function"
        @response.element = @element
        @options.onValidationComplete @response
      @resetResponse()
      return

    @checkValidBindEvents = ->
      if $.isArray(@options.validateOnEvent)
        validEvents = []
        for e of @options.validateOnEvent
          validEvents.push e  if $.inArray(e, self.allowedEvents) > -1
        @options.validateOnEvent = validEvents.join(" ")
        @bindEvents()
      else @bindEvents()  if $.inArray(@options.validateOnEvent, @allowedEvents) > -1
      return

    @bindEvents = ->
      
      # This was formerly:
      # this.$element.on( this.options.validateOnEvent, function(){...})
      # but this did not work for dynamic / AJAXed form elements
      $(document).on @options.validateOnEvent, "#" + @$element[0].id, (event) ->
        
        # Don't validate on tab (keyCode = 9)
        unless event.which is 9
          self.val = self.$element.val()
          self.validate()
        return

      return

    @exec = ->
      @checkValidBindEvents()
      return

    @exec()
    return

  
  #
  #   * Plugin wrapper
  #   
  $.fn[pluginName] = (options) ->
    
    # For every matched selector found...
    @each ->
      
      # Set some jQuery data if it doesn't already exist
      $.data this, "plugin_" + pluginName, new LazyValidation(this, options)  unless $.data(this, "plugin_" + pluginName)
      return


  return
) jQuery, window, document
