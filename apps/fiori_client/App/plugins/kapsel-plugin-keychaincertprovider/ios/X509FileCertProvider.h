//  Copyright © 2016 SAP. All rights reserved.

#import <Foundation/Foundation.h>
#import <Cordova/CDV.h>
#import "KeychainCertProvider.h"

@interface X509FileCertProvider : NSObject <CertificateProvider>
    @property (nonatomic, strong) NSString* certLabel;
    @property (nonatomic, strong) NSString* path;
    @property (nonatomic, strong) NSString* password;
@end
