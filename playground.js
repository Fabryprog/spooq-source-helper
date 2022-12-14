/*global $, ace, console*/
$('document').ready(function () {

  //temporary variable to store clipboard value
  var lastFormValue = "";

  var formObject = {
    schema: {
      example: {
        title: 'JSON Form example to start from',
        type: 'string',
        'enum': [
          'input-stream',
          'input_csv',
          'input_jdbc',
          'input_parquet',
          'sql',
          'udf',
          'custom',
          'output_csv',
          'output_jdbc',
          'output_parquet',
          'output-stream'
        ],
        'default': 'sql'
      },
      greatform: {
        title: 'JSON Form Object',
        type: 'string'
      }
    },
    form: [
      {
        key: 'example',
        notitle: true,
        prepend: 'Spooq Element',
        htmlClass: 'trywith',
        titleMap: {
          'gettingstarted': 'Getting started'
        },
        onChange: function (evt) {
          var selected = $(evt.target).val();
          loadExample(selected);
          if (history) history.pushState(
            { example: selected},
            'Example - ' + selected,
            '?example=' + selected);
        }
      },
      {
        key: 'greatform',
        type: 'ace',
        aceMode: 'json',
        width: '100%',
        notitle: true,
        onChange: function () {
          generateForm();
        }
      }
    ]
  };

  var formObject2 = {
    schema: {
      finalJSON: {
        title: 'Spooq Source',
        type: 'textarea',
        readonly: true
      },
    },
    form: [
      {
        key: 'finalJSON',
        notitle: false
      },
      {
        "type": "button",
        "title": "Copy to Clipboard",
        "onClick": function (evt) {
          evt.preventDefault();
          copyTextToClipboard();        
        }
      }
    ]
  }

  /**
   * Loads and displays the example identified by the given name
   */
  var loadExample = function (example) {
    $.ajax({
      url: 'sources/' + example + '.json',
      dataType: 'text'
    }).done(function (code) {
      var aceId = $('#form .ace_editor').attr('id');
      var editor = ace.edit(aceId);
      editor.getSession().setValue(code);
    }).fail(function () {
      $('#result').html('Sorry, I could not retrieve the example!');
    });
  };


  /**
   * Displays the form entered by the user
   * (this function runs whenever once per second whenever the user
   * changes the contents of the ACE input field)
   */
  var generateForm = function () {
    var values = $('#form').jsonFormValue();

    // Reset result pane
    $('#result').html('');
    $('#jsonform-2-elt-finalJSON').html('');

    // Parse entered content as JavaScript
    // (mostly JSON but functions are possible)
    var createdForm = null;
    try {
      // Most examples should be written in pure JSON,
      // but playground is helpful to check behaviors too!
      eval('createdForm=' + values.greatform);
    }
    catch (e) {
      $('#result').html('<pre>Entered content is not yet a valid' +
        ' JSON Form object.\n\nJavaScript parser returned:\n' +
        e + '</pre>');
      return;
    }

    // Render the resulting form, binding to onSubmitValid
    try {
      createdForm.onSubmitValid = function (values) {
        if (console && console.log) {
          console.log('Values extracted from submitted form', values);
        }
        lastFormValue = JSON.stringify(values, null, 2)
        $('#jsonform-2-elt-finalJSON').html(lastFormValue);

      };
      createdForm.onSubmit = function (errors, values) {
        if (errors) {
          console.log('Validation errors', errors);
          return false;
        }
        return true;
      };
      $('#result').html('<form id="result-form" class="form-vertical"></form>');
      $('#result-form').jsonForm(createdForm);
    }
    catch (e) {
      $('#result').html('<pre>Entered content is not yet a valid' +
        ' JSON Form object.\n\nThe JSON Form library returned:\n' +
        e + '</pre>');
      return;
    }
  };
 
 
  async function copyTextToClipboard() {
      try {
          await navigator.clipboard.writeText(lastFormValue);
          console.log('copied to clipboard')
          //alert('Copied to clipboard!')
      } catch (error) {
          console.log('failed to copy to clipboard. error=' + error);
      }
  }
  // Render the form
  $('#form').jsonForm(formObject);
  $('#form2').jsonForm(formObject2);

  // Wait until ACE is loaded
  var itv = window.setInterval(function() {

    const urlParams = new URLSearchParams(window.location.search);
    const example = urlParams.get('example') || 'input-stream';

    $('.trywith select').val(example);
    if (window.ace) {
      window.clearInterval(itv);
      loadExample(example);
    }
  }, 1000);
});
