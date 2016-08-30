//<!-- Back End -->
function Game() {
  this.progress = false;
  this.displayArea = [];
}

Game.prototype.newPlayer = function(fieldLength){
  this.progress = true;
  for(var i = 0; i < fieldLength; i++){
    if(i === Math.floor(fieldLength/2)){
      this.displayArea.push("hipster");
    } else {
    this.displayArea.push(i);
    }
  }
  return this.progress;
}

Game.prototype.createItems = function(){
  this.itemArray = [new Item("pbr", "beer"), new Item("craft", "beer"), new Item("recumbent", "bikes"), new Item("fixed", "bikes"), new Item("cigar", "cigarettes"), new Item("americanSpirit", "cigarettes"), new Item("vinyl", "music"), new Item("cd", "music"), new Item("latte", "coffee"), new Item("drip", "coffee")];
}

Game.prototype.createHipster = function(){
  this.hipsterArray = [new Hipster("beardy",["beer", "bikes", "music"], ["cigarettes", "coffee"], "http://dummyimage.com/250x250/000000/fff.png&text=B"),
  new Hipster("glasses",["cigarettes", "coffee", "music"], ["beer", "bikes"], "http://dummyimage.com/250x250/000000/fff.png&text=G"),
new Hipster("hat",["beer", "cigarettes", "coffee"], ["music", "bikes"], "http://dummyimage.com/250x250/000000/fff.png&text=H")];
}

Game.prototype.addInventory = function(itemType, itemName){
  for(var i = 0; i < this.itemArray.length; i++){
    if(this.itemArray[i].type === itemType && this.itemArray[i].name === itemName){
      this.itemArray[i].toggleInventory();
      return this.itemArray[i].inInventory;
    }
  }
}

Game.prototype.addDisplay = function(itemType, itemName, itemNumber){
  for(var i = 0; i < this.itemArray.length; i++){
    if(this.itemArray[i].type === itemType && this.itemArray[i].name === itemName){
      this.itemArray[i].toggleDisplay();
      break;
    }
  }
  if(isNaN(this.displayArea[itemNumber])){
    this.displayArea[itemNumber] = itemNumber;
  } else {
  this.displayArea[itemNumber] = "full";
  }
}

Game.prototype.getDisplayed = function(){
  this.displayedItems = [];
  for(var i = 0; i < this.itemArray.length; i++){
    if(this.itemArray[i].displayed){
      this.displayedItems.push(this.itemArray[i]);
    }
  }
}

Game.prototype.checkForHipster = function(){
  this.getDisplayed();
  for(var j = 0; j < this.hipsterArray.length; j++){
    this.hipsterArray[j].affinityMeter = 0;
    this.hipsterArray[j].checkAffinity(this.displayedItems);
  }
  this.hipsterArray.sort(function(hipster1, hipster2){
    if(hipster1.affinityMeter > hipster2.affinityMeter){
      return -1;
    }
    if(hipster2.affinityMeter > hipster1.affinityMeter){
      return 1;
    }
    return 0;
  });
  if(this.hipsterArray[0].affinityMeter === this.hipsterArray[1].affinityMeter){
    return false;
  } else {
    return this.hipsterArray[0];
  }
}

Game.prototype.clearDisplay = function(){
  this.hipsterArray.forEach(function(hipster){
    hipster.affinityMeter = 0;
  });
  this.itemArray.forEach(function(item){
    item.displayed = false;
  });
  this.displayedItems = [];
  for(var i = 0; i < this.displayArea.length; i++){
    if(!this.displayArea[i] === "hipster"){
      this.displayArea.push(i);
    }
  }
}

Game.prototype.resetEverything = function(){
  this.hipsterArray.forEach(function(hipster){
    hipster.affinityMeter = 0;
  });
  this.itemArray.forEach(function(item){
    item.displayed = false;
    item.inInventory = false;
  });
  this.displayedItems = [];
  this.displayArea = [];
}


function Item(name, type) {
  this.name = name;
  this.type = type;
  this.inInventory = false;
  this.displayed = false;
}

Item.prototype.toggleInventory = function(){
  this.inInventory = !this.inInventory;
  if(!this.inInventory && this.displayed){
    this.displayed = false;
  }
}

Item.prototype.toggleDisplay = function(){
  if(this.inInventory){
    this.displayed = !this.displayed;
  }
  return this.displayed;
}

function Hipster(type, likedItems, dislikedItems, imgLink) {
  this.type = type;
  this.likedItems = likedItems;
  this.dislikedItems =  dislikedItems;
  this.imgLink = imgLink;
  this.affinityMeter = 0;
}

Hipster.prototype.checkAffinity = function(displayedItems){
  for(var i = 0; i < displayedItems.length; i++){
    if(this.likedItems.indexOf(displayedItems[i].type) !== -1){
      this.affinityMeter++;
    } else if(this.dislikedItems.indexOf(displayedItems[i].type) !== -1){
      this.affinityMeter--;
    }
  }
  return this.affinityMeter;
}


//<!-- Front End  -->
$(document).ready(function(){
  var inventoryItems = 0;
  //game initialization
  var newGame = new Game();
  newGame.newPlayer($("#yard .row div").length);
  newGame.createItems();
  newGame.createHipster();

  $("#toggleInstructions").click(function(){
    $("#instructions").toggle();
  });

  $("#inventoryButton").click(function(){
    $("#inventory").toggle();
  });

  $("#storeButton").click(function(){
    $("#store").toggle();
  });

  $("#clearItemsButton").click(function(){
    newGame.clearDisplay();
    resetDisplay();
  });

  $("#newGameButton").click(function(){
    if (confirm("This will completely reset the game, continue?")){
      newGame.resetEverything();
    resetDisplay();
    $("#inventory-row img").remove();
    $("#store img").removeClass("lowOpacity");
    newGame.newPlayer($("#yard .row div").length);
    inventoryItems = 0;
    }
  });

  function resetDisplay(){
    $("#yard img.itemImage").remove();
    $("#hipsterImage").hide();
    $("#inventory-row img").removeClass("lowOpacity");
  }

  $("#store img").click(function(){
    $("#fullInventory").hide();
    var clickedImg = $(this).attr("src");
    var itemIdArray = $(this).attr("id").split("_");
    var itemType = itemIdArray[0];
    var itemName = itemIdArray[1];
    //if clicked (store) image has lowOpacity class then it is already in inventory
    if($(this).hasClass("lowOpacity")){
      //find image in inventory and remove it, then remove lowOpacity class from store and toggle inInventory in game object
      $("#inventory-row img").each(function(index){
        if($(this).hasClass(itemType + "_" + itemName)){
          $("#" + itemType + "_" + itemName).removeClass("lowOpacity");
          $(this).remove();
          newGame.addInventory(itemType, itemName);
          inventoryItems--;
        }
      });
    } else {
      //if under 3 items and object does not have lowOpacity class, can add to inventory
      if(inventoryItems < 3){
        if(newGame.addInventory(itemType, itemName)){
          inventoryItems++;
          //find first empty div and shove image inside - return false breaks the each loop
          $("#inventory-row div").each(function(){
            if(!$(this).html()){
              $(this).append("<img class='" + itemType + "_" + itemName + "' src='" + clickedImg + "'>");
              $(this).children("img").click(inventoryImgClick);
              return false;
            }
          });
          $("#"+ itemType + "_" + itemName).addClass("lowOpacity");
        }
      } else {
          //if more than 3 items can't add more
          $("#fullInventory").show();
      }
    }
  });

  function inventoryImgClick(){
    //debugger;
    var clickedItemArray = $(this).attr("class").split("_");
    var clickedItemType = clickedItemArray[0];
    var clickedItemName = clickedItemArray[1];
    var clickedImgSrc = $(this).attr("src");
    var hipster;
    if($(this).hasClass("lowOpacity")){
      //remove
      $(this).removeClass("lowOpacity");
      clickedItemArray = $(this).attr("class").split("_");
      $("#yard img").each(function(){
        var imgId = $(this).attr("id").split("-");
        if(imgId[0] === clickedItemArray.join("_")){
          $(this).remove();
          newGame.addDisplay(clickedItemArray[0], clickedItemArray[1], parseInt(imgId[1]));
          hipster = newGame.checkForHipster();
          if(hipster){
            $("#hipsterImage").attr("src", hipster.imgLink);
            $("#hipsterImage").show();
          } else {
            $("#hipsterImage").hide();
          }
        }
      });
    } else {
      //add
      var randomSquare;
      do{
        randomSquare = Math.floor(Math.random() * $("#yard .row div").length);
      }while(!randomSquare || randomSquare === 4 || isNaN(newGame.displayArea[randomSquare]))
      var counter = 0;
      $("#yard .row div").each(function(){
        if(counter === randomSquare){
          $(this).append("<img class='itemImage' id='" + clickedItemType + "_" + clickedItemName + "-"+ randomSquare + "' src='" + clickedImgSrc + "'>");
          newGame.addDisplay(clickedItemType, clickedItemName, randomSquare);
          hipster = newGame.checkForHipster();
          if(hipster){
            $("#hipsterImage").attr("src", hipster.imgLink);
            $("#hipsterImage").show();
          } else {
            $("#hipsterImage").hide();
          }
          return false;
        }
        counter++;
      });
      $(this).addClass("lowOpacity");
    }
  }

});
