'use strict'

angular.module 'elektorApp'
.service 'uiBlock', ($localStorage)->

  block: (element, message) ->
    msg = if message? then message else 'Processing...'
    element = if element? then element else 'html'

    $localStorage.blockedElement = element

    $( ->
      angular.element(element).block message: "<div class='alert alert-info'>#{msg}</div>", css: height: "38px", border: ""
    )

  clear: ->
    angular.element($localStorage.blockedElement).unblock()
