var shouldFinish = true;
var recognition = new webkitSpeechRecognition();

function asr_start_function(){
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognitionFormControl(true);
  recognition.lang = $('#selectLang').val();
  
  shouldFinish = false;
  recognition.start();
}

function asr_stop_function(){
  recognitionFormControl(false);
  shouldFinish = true;
  recognition.stop();
}

function recognitionFormControl(start){
  if(start){
    $('#recognitionStartButton').attr('disabled','true');
    $('#recognitionStopButton').attr('disabled','false');
    $('#recognitionStopButton').removeAttr('disabled');
  }else{
    $('#recognitionStopButton').attr('disabled','true');
    $('#recognitionStartButton').attr('disabled','false');
    $('#recognitionStartButton').removeAttr('disabled');
  }
}

;(function(d,$){//maybe for events
  
  //Speech Synthesis
  if (!('SpeechSynthesisUtterance' in window)){
    $('#messageArea').html("<p>SpeechSynthesisUtteranceが見つかりません。PC版のChromeで試してみてください。</p>");
    return;
  }
  
  $('#synthesisButton').click(function(){
    var synthesis = new SpeechSynthesisUtterance();
    synthesis.volume = 1;
    synthesis.rate = 1;
    synthesis.pitch = 2;
    synthesis.text = $('#synthesisText').val();
    synthesis.lang = $('#selectLang').val();
    
    speechSynthesis.speak(synthesis);
  });

  //Speech Recognition
  if (!('webkitSpeechRecognition' in window)){
    $('#messageArea').html("<p>webkitSpeechRecognitionが見つかりません。PC版のChromeで試してみてください。</p>");
    return;
  }

  recognitionFormControl(false);

  $('#recognitionStartButton').click(function(){
    asr_start_function();
  });

  $('#recognitionStopButton').click(function(){
    asr_stop_function();
  });

  recognition.onstart = function(){
    $('#messageArea').html("<p>state: start</p>");
  };

  recognition.onend = function(){
    $('#messageArea').html("<p>state: end, start againg</p>");
    //recognitionFormControl(false);
    
    if(shouldFinish==false){
        asr_start_function();
        //document.getElementById('recognitionStartButton').click();
    }
  };

  recognition.onspeechstart = function(){
    $('#messageArea').html("<p>state: speechstart</p>");
  };

  recognition.onspeechend = function(){
    $('#messageArea').html("<p>state: speechend</p>");
  };

  recognition.onnomatch = function(){
    $('#messageArea').html("<p>state: nomatch</p>");
  };

  recognition.onerror = function(){
    $('#messageArea').html("<p>state: error, start againg</p>");
    //recognitionFormControl(false);
    if(shouldFinish==false){
        asr_start_function();
        //document.getElementById('recognitionStartButton').click();
    }
  };


  recognition.onresult = function(e){
    var results = e.results;
    for(var i = e.resultIndex; i<results.length; i++){
      if(results[i].isFinal){
        $('#recognitionText').val(results[i][0].transcript).removeClass('isNotFinal');
        var confidence = results[i][0].confidence;
        $('#messageArea').html(
          "<p>state: onresult<br>" +
          "confidence: " + confidence + "</p>"
          );
          console.log( "result: "+results[i][0].transcript + "\nconfidence: " + confidence);

      }else{
        $('#recognitionText').val(results[i][0].transcript).addClass('isNotFinal');
        console.log( "interimresult: "+results[i][0].transcript);
      }
    }
  };


})(document,jQuery);
