// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.


const additionCard = require('../resources/additionCard.json');
const { ActivityHandler, CardFactory } = require('botbuilder');

const {

    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    DialogSet,
    DialogTurnStatus,
    NumberPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');


const CHOICE_PROMPT = 'CHOICE_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class CalculationDialog extends ComponentDialog {
    constructor() {
        super('calculationDialog');

        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.options.bind(this),
            this.calculationCard.bind(this),
            this.resultCard.bind(this),
         
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */

    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);
        console.log("started")

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async options(step) {
        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
        // Running a prompt here means the next WaterfallStep will be run when the user's response is received.

        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please select an option for calculation.',
            choices: ChoiceFactory.toChoices(['Addition', 'Multiplication', 'Division'])
        });
        
    }

    async calculationCard(step) {

        additionCard.actions[0].data.prop2[0]=step.result.value
        console.log("addition_card",additionCard.actions[0].data);

        await step.context.sendActivity({
          
            attachments: [CardFactory.adaptiveCard(additionCard)]
        });

        return await step.endDialog();

    }

    async resultCard(step) {

        //additionCard.actions[0].data.prop2[0]=step.result.value
        //console.log("addition_card",additionCard.actions[0].data);
        
        console.log(step.result.value)
        return await step.context.sendActivity({
          
            attachments: [CardFactory.adaptiveCard(additionCard)]
        });

        //return await step.endDialog();

    }

}

module.exports.CalculationDialog = CalculationDialog;

/**    "body": [
      {
        "type": "Input.Number",
        "id": "id_one"
      },
      {
        "type": "Input.Number",

        
        "id": "id_two"
      }
    ],
    
    
          {
        "type": "Action.Submit",
        "title": "Submit",
        "data": {
          "prop1": true,
          "prop2": []
        }
      },
      
      ** */
