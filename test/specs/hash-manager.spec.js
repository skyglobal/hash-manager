document.body.innerHTML = __html__['_site/index.html'];

var hash = skyComponents['hash-manager'];

//hash-manager.init(); //live events don't init for karma, so init them here if you need to

describe('hash-manager module can ', function () {

        it('cleans up any occurence of the # character in the hash', function () {
            expect(hash.cleanHash('#news')).toBe('news');
            expect(hash.cleanHash('#sports')).toBe('sports');
        });

        it('also cleans up any occurence of the ! character in the hash', function () {
            expect(hash.cleanHash('#!news')).toBe('news');
            expect(hash.cleanHash('#!sports')).toBe('sports');
        });

        it('Will execute an assigned function when the documents hash changes', function (done) {
            var count = 0,
                callback = function () {
                    count++;
                    expect(count).toBe(1);
                    done();
                };
            hash.register(['unregistered-hash-link'], callback);

            try {
                hash.register(['unregistered-hash-link'], callback);
                expect('Error should have been thrown').toBe(false);
            } catch (e) {
                expect(e.message).toBe('hashManager: hash (unregistered-hash-link) already exists');
            }
            location.hash = 'unregistered-hash-link';
        });

        it('Will execute an undo function when the hash is changed back', function(done) {
            hash.change('');
            var callbackCount= 0,undoCallbackCount= 0,
                callback1 = function (hash) {
                    callbackCount++;
                },
                undoCallback = function (hash) {
                    undoCallbackCount++;
                };
            setTimeout(function(){
                hash.register(['test-undo-callback'], callback1, undoCallback);
                hash.change('test-undo-callback');
                setTimeout(function(){
                    expect(callbackCount).toBe(1);
                    expect(undoCallbackCount).toBe(0);
                    expect(location.hash).toBe('#!test-undo-callback');
                    hash.remove();
                    setTimeout(function(){
                        expect(callbackCount).toBe(1);
                        expect(undoCallbackCount).toBe(1);
                        expect(location.hash).toBe('');
                        done();
                    },5);
                },5);
            },5);
        });


        it('Will execute an assigned function when the documents current hash is registered later', function(done){
            hash.change('page-load-hash');
            var count = 0,
                callback = function () {
                    count++;
                };
            setTimeout(function() {
                hash.register(['page-load-hash'], callback);
                setTimeout(function() {
                    hash.register(['something'], callback);
                    setTimeout(function() {
                        expect(count).toBe(1);
                        done();
                    }, 5);
                }, 5);
            }, 5);
        });

        it('can register a single hash (string), or multiple (array)', function (done) {
            hash.change('');
            var count = 0,
                callback = function () {
                    count++;
                };
            setTimeout(function() {
                hash.register('single-hash', callback);
                hash.register(['array-hash-1','array-hash-2'], callback);
                expect(count).toBe(0);
                setTimeout(function(){
                    hash.change('single-hash');
                    setTimeout(function() {
                        expect(count).toBe(1);
                        expect(location.hash).toBe('#!single-hash');
                        hash.change('array-hash-2');
                        setTimeout(function() {
                            expect(count).toBe(2);
                            expect(location.hash).toBe('#!array-hash-2');
                            hash.change('array-hash-1');
                            setTimeout(function() {
                                expect(count).toBe(3);
                                expect(location.hash).toBe('#!array-hash-1');
                                done();
                            },5);
                        },5);
                    },5);
                },5);
            },5);

        });

        it('can change the documents location with .changeHash()', function () {
            hash.change('newHash');
            expect(location.hash).toBe('#!newHash');
            hash.change('my-this-is-wonderful');
            expect(location.hash).toBe('#!my-this-is-wonderful');
        });

        describe(' Can Register Wildcards (\'/*\')', function () {

            it('so multiple unknown hashes execute the same functions', function(done) {
                hash.change('');
                var count= 0,
                    callback = function (hash) {
                        count++;
                    };
                setTimeout(function(){
                    hash.register(['test-wildcard/*'], callback);
                    hash.change('test-wildcard/first');
                    setTimeout(function(){
                        expect(count).toBe(1);
                        expect(location.hash).toBe('#!test-wildcard/first');
                        hash.change('test-wildcard/second');
                        setTimeout(function(){
                            expect(count).toBe(2);
                            expect(location.hash).toBe('#!test-wildcard/second');
                            hash.change('test-wildcard');
                            setTimeout(function(){
                                expect(count).toBe(3);
                                expect(location.hash).toBe('#!test-wildcard');
                                hash.change('test-wild');
                                setTimeout(function(){
                                    expect(count).toBe(3);
                                    expect(location.hash).toBe('#!test-wild');
                                    done();
                                },5);
                            },5);
                        },5);
                    },5);
                },5);
            });

            it('prioritises exact hashes over wildcard hashes', function(done) {
                hash.change('');
                var count1= 0,count2= 0,
                    callback1 = function (hash) {
                        count1++;
                    },
                    callback2 = function (hash) {
                        count2++;
                    };
                setTimeout(function(){
                    hash.register(['test-prioritisation/*'], callback1);
                    hash.register(['test-prioritisation/exact'], callback2);
                    hash.change('test-prioritisation/exact');
                    setTimeout(function(){
                        expect(count2).toBe(1);
                        expect(count1).toBe(0);
                        expect(location.hash).toBe('#!test-prioritisation/exact');
                        hash.change('test-prioritisation/unknown');
                        setTimeout(function(){
                            expect(count2).toBe(1);
                            expect(count1).toBe(1);
                            expect(location.hash).toBe('#!test-prioritisation/unknown');
                            done();
                        },5);
                    },5);
                },5);
            });

            it('two similar hash\'s (\'pete\' and \'peter\') still execute two different function', function(done) {
                var count1= 0,
                    count2= 0,
                    callback1 = function (hash) {
                        count1++;
                    },
                    callback2 = function (hash) {
                        count2++;
                    };
                hash.register(['my-main-hash-man'], callback1);
                hash.register(['my-main-hash-manager'], callback2);
                expect(count1).toBe(0);
                hash.change('my-main-hash-man');
                setTimeout(function(){
                    expect(count1).toBe(1);
                    expect(count2).toBe(0);
                    hash.change('my-main-hash-manager');
                    setTimeout(function(){
                        expect(count1).toBe(1);
                        expect(count2).toBe(1);
                        done();
                    },5);
                },5);
            });

            it('Will execute an assigned wildcard function when documents current hash is registered later', function (done) {
                hash.change('page-load/hash');
                var count = 0,
                    callback = function () {
                        count++;
                    };
                setTimeout(function() {
                    hash.register(['page-load/*'], callback);
                    setTimeout(function() {
                        hash.register(['something/else'], callback);
                        setTimeout(function() {
                            expect(count).toBe(1);
                            done();
                        }, 5);
                    }, 5);
                }, 5);
            });

            it('Will execute the correct undo callback for a wildcard hash', function(done) {
                hash.change('');
                var callbackCount= 0,undoCallbackCount= 0,
                    callback1 = function (hash) {
                        callbackCount++;
                    },
                    undoCallback = function (hash) {
                        undoCallbackCount++;
                    };
                setTimeout(function(){
                    hash.register(['test-undo/*'], callback1, undoCallback);
                    hash.change('test-undo/exact');
                    setTimeout(function(){
                        expect(callbackCount).toBe(1);
                        expect(undoCallbackCount).toBe(0);
                        expect(location.hash).toBe('#!test-undo/exact');
                        hash.remove();
                        setTimeout(function(){
                            expect(callbackCount).toBe(1);
                            expect(undoCallbackCount).toBe(1);
                            expect(location.hash).toBe('');
                            done();
                        },5);
                    },5);
                },5);
            });
        });

        describe("Query string in hashmanager support", function () {

            it("using a query string in the hashbang does the callback", function (done) {
                hash.change('');

                var count = 0,
                    callback = function () {
                        count++;
                    };

                var hashName = 'tileTitle',
                    queryString = '?pid=3434&altpid=3444';
                hash.register(hashName, callback);

                hash.change(hashName + queryString);

                setTimeout(function() {
                    expect(location.hash).toBe('#!' + hashName + queryString);

                    expect(count > 0).toBe(true);

                    done();
                }, 5);


            });
        });


});
