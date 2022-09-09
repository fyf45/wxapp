let app = getApp();

Page({
  data: {
    canSubmit: false,
    currentTab: 0,
  },
  bindTabSwitch(event) {
    let tabIndex = event.currentTarget.dataset.index;
    this.setData({
      currentTab: tabIndex
    })
    this.onPageChanged();
  },
  bindNextPageTap(e) {
    let nextTabIndex = this.data.currentTab + 1;
    let tabLength = this.data.phases.length;
    this.setData({
      currentTab: nextTabIndex >= tabLength ? tabLength : nextTabIndex
    })
    this.onPageChanged();
  },
  onPageChanged() {
    this.setData({
      scrollTop: 0,
      isLastPage: this.data.currentTab >= this.data.phases.length - 1
    })
  },
  bindOptionTap(e) {
    let phases = this.data.phases;
    let phase = phases[this.data.currentTab];
    let element = phase.elements[e.target.dataset.element];
    let currentOption = element.options[e.target.dataset.option];
    let elementSelectedCount = 0;
    let canSubmit = true;

    element.selectedOptions = [];
    for (let i = 0; i < element.options.length; i++) {
      let option = element.options[i];
      option.isSelected = option == currentOption ? !option.isSelected : element.isMultiple ? option.isSelected : false;
      elementSelectedCount += option.isSelected;
      if (option.isSelected) {
        element.selectedOptions.push(option);
      }
    }
    element.isFinished = elementSelectedCount > 0;
    phase.isFinished = true;

    for (let i = 0; i < phases.length; i++) {
      let phase = phases[i];
      let phaseSelectedCount = 0;
      for (let j = 0; j < phase.elements.length; j++) {
        let element = phase.elements[j];
        phase.isFinished &= element.isFinished;
        if (element.isRequired) {
          canSubmit &= element.isFinished;
        }
        phaseSelectedCount += element.isFinished || 0;
      }
      phase.percentage = 100 * phaseSelectedCount / phase.elements.length;
    }
    
    this.setData({
      "phases": phases,
      "canSubmit": canSubmit
    })
    if (phase.isFinished) {
      if (this.data.currentTab + 1 < phases.length) {
        //this.bindNextPageTap();
      } else if(canSubmit) {
        this.bindSubmitTap();
      }
    }
  },
  bindSubmitTap: function(e) {
    this.setData({
      canSubmit: false
    })
    app.invokeAPI("diagnostic", {
      "diagnosticCode": this.data.diagnosticCode,
      "diagnosticName": this.data.diagnosticName,
      "phases": this.data.phases
    }, function(res) {
      if (res.message) {
        wx.navigateTo({
          url: '../diseaseResult/diseaseResult?disease=' + res.message,
        })
      }
    }.bind(this), function(err) {
      app.showError("辩证失败");
      this.setData({
        canSubmit: true
      })
    }.bind(this), true, "辩证中...");
  },
  onLoad: function(options) {
    app.loadJSON(this, "dysmenorrhea", function(res) {
      //wx.setNavigationBarTitle(res.diagnosticName);
      this.onPageChanged();
    }.bind(this));
  }
})